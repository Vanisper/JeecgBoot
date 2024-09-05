export default class Printarea {
  standards: { strict: string; loose: string; html5: string };
  counter: number;
  settings: {
    standard: string;
    extraHead: string; // 附加在head标签上的额外元素,使用逗号分隔
    extraCss: string; // 额外的css逗号分隔
    popTitle: string; // 标题
    endCallback: (() => void) | null; // 成功打开后的回调函数
    el: string;
    id?: string;
  };

  constructor(option: Partial<Printarea['settings']>) {
    this.standards = {
      strict: 'strict',
      loose: 'loose',
      html5: 'html5',
    };
    this.counter = 0;
    this.settings = {
      standard: this.standards.html5,
      extraHead: '', // 附加在head标签上的额外元素,使用逗号分隔
      extraCss: '', // 额外的css逗号分隔
      popTitle: '', // 标题
      endCallback: null, // 成功打开后的回调函数
      el: '', // 局部打印的id
    };
    Object.assign(this.settings, option);
    this.init();
  }
  init() {
    this.counter++;
    this.settings.id = `printArea_${this.counter}`;
    const box = document.getElementById(this.settings.id);
    if (box) {
      box.parentNode?.removeChild(box);
    }
    const PrintAreaWindow = this.getPrintWindow(); // 创建iframe
    this.write(PrintAreaWindow.doc); // 写入内容
    //this.print(PrintAreaWindow);
    this.settings.endCallback?.();
  }
  print(PAWindow: Window | ReturnType<Printarea['Iframe']> | null) {
    const paWindow = PAWindow;
    console.log('---调用打印 focus-----');
    paWindow?.focus();
    paWindow instanceof Window && paWindow?.print();
    console.log('---调用打印 print-----');
  }
  write(PADocument: Document | null, $ele?: HTMLElement) {
    PADocument?.open();
    PADocument?.write(`${this.docType()}<html>${this.getHead()}${this.getBody()}</html>`);
    PADocument?.close();
  }
  docType() {
    if (this.settings.standard === this.standards.html5) {
      return '<!DOCTYPE html>';
    }
    const transitional = this.settings.standard === this.standards.loose ? ' Transitional' : '';
    const dtd = this.settings.standard === this.standards.loose ? 'loose' : 'strict';

    return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01${transitional}//EN" "http://www.w3.org/TR/html4/${dtd}.dtd">`;
  }
  getHead() {
    let extraHead = '';
    let links = '';
    let style = '';

    if (this.settings.extraHead) {
      const matches = this.settings.extraHead.match(/([^,]+)/g);
      if (matches) {
        extraHead = matches.join('');
      }
    }
    document.querySelectorAll('link').forEach(function (item, i) {
      if (item.href.indexOf('.css') >= 0) {
        links += '<link type="text/css" rel="stylesheet" href="' + item.href + '" >';
      }
    });

    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].cssRules || document.styleSheets[i].rules) {
        const rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
        for (let b = 0; b < rules.length; b++) {
          try {
            style += rules[b].cssText;
          } catch (err) {}
        }
      }
    }

    if (this.settings.extraCss) {
      const matches = this.settings.extraCss.match(/([^,\s]+)/g);
      matches?.forEach((m) => {
        links += `<link type="text/css" rel="stylesheet" href="${m}">`;
      });
    }

    return `<head><title>${this.settings.popTitle}</title>${extraHead}${links}<style type="text/css">${style}</style></head>`;
  }
  getBody() {
    const ele = this.getFormData(document.querySelector(this.settings.el));
    const htm = ele?.outerHTML;
    console.log('htm', htm);
    return '<body>' + htm + '</body>';
  }
  // 处理form表单的默认状态
  getFormData(ele: HTMLElement | null) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const copy = ele?.cloneNode(true) as HTMLElement;

    //update-begin--Author:sunjianlei  Date:20190510 for：支持忽略打印的标签----------------------
    const allElements = copy?.querySelectorAll('*');
    allElements?.forEach((item) => {
      let attr = item.getAttribute('ignore-print');
      attr = attr == null ? item.getAttribute('ignoreprint') : attr;
      if (attr != null && attr.toString() === 'true') {
        item.outerHTML = '';
      }
    });
    //update-end--Author:sunjianlei  Date:20190510 for：支持忽略打印的标签----------------------

    const copiedInputs = copy.querySelectorAll<HTMLInputElement>('input,select,textarea');
    copiedInputs.forEach(function (item, i) {
      let typeInput = item.getAttribute('type');
      const copiedInput = copiedInputs[i];
      // update-begin--Author:sunjianlei  Date:20191101 for：优化赋值逻辑方式 ----------------------
      if (typeInput == null) {
        typeInput = item.tagName === 'SELECT' ? 'select' : item.tagName === 'TEXTAREA' ? 'textarea' : '';
      }
      if (typeInput === 'radio' || typeInput === 'checkbox') {
        item.checked && copiedInput.setAttribute('checked', item.checked.toString());
      } else if (typeInput === 'select') {
        copiedInput.querySelectorAll('option').forEach(function (op, b) {
          if (op.selected) {
            op.setAttribute('selected', true.toString());
          }
        });
      } else if (typeInput === 'textarea') {
        // update-begin--Author:sunjianlei  Date:20220302 for：修复textarea换行会出现<br>的问题 ----------------------
        copiedInput.innerHTML = item.value;
        // update-end----Author:sunjianlei  Date:20220302 for：修复textarea换行会出现<br>的问题 ----------------------
      } else {
        copiedInput.value = item.value;
        copiedInput.setAttribute('value', item.value);
      }
      //update-end--Author:sunjianlei  Date:20191101 for：优化赋值逻辑方式 ----------------------
    });

    //update-begin--Author:jianlei  Date:20190507 for：支持Canvas打印--------------------
    const sourceCanvas = ele?.querySelectorAll('canvas');
    const copyCanvas = copy.querySelectorAll('canvas');

    copyCanvas.forEach(function (item, i) {
      // update-begin--author:sunjianlei date:20220407 for：echarts canvas宽度自适应 ---------
      if (that.isECharts(item)) {
        if (item.parentElement?.style.width) {
          item.parentElement.style.width = '100%';
          item.parentElement.style.height = 'auto';
        }
        if (item.parentElement?.parentElement?.style.width) {
          item.parentElement.parentElement.style.width = '100%';
          item.parentElement.parentElement.style.height = 'auto';
        }
      }
      // update-end--author:sunjianlei date:20220407 for：echarts canvas宽度自适应 ---------

      const url = sourceCanvas?.[i].toDataURL();
      //update-begin--Author:sunjianlei  Date:20190510 for：canvas宽度自适应----------------------
      item.outerHTML = '<img src="' + url + '" style="width:100%;"/>';
      //update-end--Author:sunjianlei  Date:20190510 for：canvas宽度自适应----------------------
    });
    //update-end--Author:jianlei  Date:20190507 for：支持Canvas打印----------------------

    return copy;
  }

  /**
   * 判断是否是 ECharts 的 Canvas
   *
   * @param item canvas
   * @time 2022-4-7
   * @author sunjianlei
   */
  isECharts(item) {
    const attrName = '_echarts_instance_';
    const parent = item.parentElement;
    if (parent.getAttribute(attrName) != null) {
      return true;
    }
    if (parent.parentElement) {
      return parent.parentElement.getAttribute(attrName) != null;
    }
    return false;
  }

  getPrintWindow() {
    const f = this.Iframe();
    return {
      win: f.contentWindow || f,
      doc: f.doc,
    };
  }
  Iframe() {
    const frameId = this.settings.id;
    let iframe: HTMLIFrameElement & { doc: Document | null; document: Document | null };
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    try {
      // @ts-ignore
      iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      iframe.style.border = '0px';
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.right = '0px';
      iframe.style.top = '0px';
      frameId && iframe.setAttribute('id', frameId);
      iframe.setAttribute('src', new Date().getTime().toString());
      iframe.doc = null;
      iframe.onload = function () {
        const win = iframe.contentWindow || iframe;
        that.print(win);
      };
      iframe.doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow ? iframe.contentWindow.document : iframe.document;
    } catch (e) {
      throw new Error(e + '. iframes may not be supported in this browser.');
    }

    if (iframe.doc == null) {
      throw new Error('Cannot find document.');
    }

    return iframe;
  }
}
