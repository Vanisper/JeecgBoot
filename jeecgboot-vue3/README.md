# jeecgboot-vue3-fix-init

本项目源自 `JeecgBoot/tree/master/jeecgboot-vue3` —— [70607dbe](https://github.com/jeecgboot/JeecgBoot/commit/70607dbe2bf0356edaaf7e708a5a7024855a1b8c) ，修改而成。

主要是做了一些依赖的更新以及，以及错误的修复。


## 使用

```shell
# 初始化一个新的 Git 仓库
git init <target_directory>
cd <target_directory>

# 添加远程仓库
git remote add origin <repository_url>

# 设置允许克隆子目录
git config core.sparsecheckout true

# 设置要检出的子目录
git sparse-checkout set <subdirectory_path>

# 拉取指定分支的内容
git pull origin <branch_name>
```


例如，要克隆仓库 https://github.com/Vanisper/JeecgBoot.git 中 development 分支的 jeecgboot-vue3 目录到 ~/Documents/Projects/jeecgboot-vue3-demo，可以运行：
  
```shell
# 初始化一个新的 Git 仓库
git init ~/Documents/Projects/jeecgboot-vue3-demo
cd ~/Documents/Projects/jeecgboot-vue3-demo

# 添加远程仓库
git remote add origin https://github.com/Vanisper/JeecgBoot.git

# 设置允许克隆子目录
git config core.sparsecheckout true

# 设置要检出的子目录
echo "jeecgboot-vue3" >> .git/info/sparse-checkout

# 拉取指定分支的内容
git pull origin development

# 移动子目录内容到当前目录
mv jeecgboot-vue3/* .

# 删除多余的子目录
rm -rf jeecgboot-vue3

# 删除临时的 git 目录
rm -rf .git
```
