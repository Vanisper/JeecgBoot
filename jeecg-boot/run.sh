# 获取项目版本号
VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout)

# 缓存文件路径
CLASSPATH_CACHE="classpath.cache"

# 检查是否需要刷新缓存 | 如果需要刷新缓存，可以使用 -r 选项
REFRESH_CACHE=false
while getopts "r" opt; do
  case $opt in
    r)
      REFRESH_CACHE=true
      ;;
    *)
      ;;
  esac
done

# 构建项目
mvn clean package

# 获取项目依赖的类路径
# CLASSPATH=$(mvn dependency:build-classpath -Dmdep.outputFile=/dev/stdout -q)
if [ "$REFRESH_CACHE" = true ] || [ ! -f "$CLASSPATH_CACHE" ]; then
  echo "刷新类路径缓存..."
  mvn dependency:build-classpath -Dmdep.outputFile=$CLASSPATH_CACHE -q
fi

# 读取缓存的类路径
CLASSPATH=$(cat $CLASSPATH_CACHE)

java \
  -Dspring.profiles.active=local \
  -Dspring.output.ansi.enabled=always \
  -Dfile.encoding=UTF-8 \
  -classpath "target/classes:$CLASSPATH" \
  cn.hamm.demo.Application
#   -Dspring.config.location=classpath:/application-local-vanisper.yml \

# jar tf target/airpower-java-starter-1.0.0.jar | grep Application.class
# 运行项目 | 直接执行 jar 包
# java -jar target/airpower-java-starter-${VERSION}.jar \
#   -Dspring.config.location=classpath:/application-local-vanisper.yml

# /Library/Java/JavaVirtualMachines/jdk-17.0.12+7/Contents/Home/bin/java
# -XX:TieredStopAtLevel=1
# -Dspring.profiles.active=local-vanisper
# -Dspring.output.ansi.enabled=always
# -Dcom.sun.management.jmxremote
# -Dspring.jmx.enabled=true
# -Dspring.liveBeansView.mbeanDomain
# -Dspring.application.admin.enabled=true
# -Dmanagement.endpoints.jmx.exposure.include=*
# -javaagent:/Applications/IntelliJ IDEA.app/Contents/lib/idea_rt.jar=51190:/Applications/IntelliJ IDEA.app/Contents/bin
# -Dfile.encoding=UTF-8
# -classpath /private/var/folders/z0/fb4nv0594w33ss08jd93bl640000gn/T/classpath1373709592.jar cn.hamm.demo.Application

