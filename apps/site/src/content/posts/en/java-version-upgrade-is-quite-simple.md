---
title: "Java version upgrade is quite simple. All you need to do is... (Part 3)"
canonicalSlug: "java-version-upgrade-is-quite-simple"
language: "en"
publishedAt: 2023-10-20
summary: "Part 3 of the Java upgrade series: a concise decision framework distilling Parts 1 and 2, and a worked example of how my team used it in practice."
tags: []
translations:
  en: "java-version-upgrade-is-quite-simple"
coverImage: "/blog/java-version-upgrade-is-quite-simple/01.png"
---
After [Part 1 deconstructed what the “Java version” is](/en/blog/java-version-upgrade-is-not-as-simple/) and [Part 2 covered the reasoning behind the upgrade / don’t upgrade decision in depth](/en/blog/java-version-upgrade-is-not-as-simple-af8/), I feel I’ve finally explained you everything - the blog format that I find not very lightweight and enjoyable. Time for the “I had this problem, and here is how I solved it - short, fun, and incomplete story” format I like much more. *Part 3 summarizes Parts 1 and 2 into a concise decision framework, and shows examples of how my team uses it in practice.*

### 📐 How to select Java upgrade strategy?

**Step 1: Runtime JVM version.** If you develop a library - go to step 2 😝

If you don’t fully control your runtime environment, use the latest available runtime JVM version. *(for example, if you use AWS Lambda, use Java 17)*

![](/blog/java-version-upgrade-is-quite-simple/02.png)

If you use a cloud provider, learn about their JVM distribution (good list - [sdkman.io/jdks](https://sdkman.io/jdks)). If you see value in their offering - use it. *(for example, Amazon Corretto provides [an alternative crypto provider optimized for AWS infrastructure](https://github.com/corretto/amazon-corretto-crypto-provider))*

![](/blog/java-version-upgrade-is-quite-simple/03.png)

If your service will be actively developed over the next year - use the latest JVM feature release available. Upgrade to every new feature release and at least do one minor release upgrade every feature release cycle.

If your service is going straight to maintenance mode - use the latest JVM LTS release available and [Eclipse Temurine](https://adoptium.net/temurin/releases/) distribution - they are likely to have the most prolonged support period. In case of a security incident or critical bug - do a minor upgrade to get the fix.

If you need a Docker image - use the [one provided by Eclipse Temurin](https://hub.docker.com/_/eclipse-temurin). If image size is important to you - use jlink as described [here](https://github.com/docker-library/docs/tree/master/eclipse-temurin#creating-a-jre-using-jlink). In case you need a customized image (for example, you need it to include debug tools) - consider an option to take an OS base image and install OpenJDK into it.

Never enable `--enable-preview` for JVM runtime.

**Step 2: Build-time JDK version, dev env JDK version, tests JVM version.** Use the same vendor and version as for the runtime JVM version. If you don't use jlink, it may even be the same Docker image, although you may need to add some build tools to it.

In case you develop a library - just use the latest LTS version for build-time JDK, development environment JDK, and tests JVM. It may also be a good idea to test your library with other JVM versions (all LTS and one latest feature release), especially if it uses nontrivial or internal JDK APIs.

If the latest version of your build tool does not support the JDK version you need, use the previous feature version and try to upgrade in a month - this is usually enough time. You may also need to downgrade the source and target Java versions in such a situation.

Never enable `--enable-preview` for JVM in build time, in the development environment, or in tests.

**Step 3: Source and target version.** If you develop a library - using the latest LTS version as a source and target Java versions is a good default choice as it is a sweet spot between supporting most of potential customers without tying yourself to legacy versions too much. Of course, you may have specific commitments to your library consumers to support earlier versions. If library development is not your case - use the same major version as you use for the runtime JVM version.

Run all tests you have and deploy to the QA environment. If you see errors in logs:

```
java.lang.IllegalArgumentException: Unsupported class file major version
```

Try to upgrade to the latest version of the library that caused the problem (the error originates from outdated [ASM transitive dependency](https://asm.ow2.io/)). If the problem persists - report it to library maintainers (example: [github.com/gradle/test-retry-gradle-plugin/issues/165](https://github.com/gradle/test-retry-gradle-plugin/issues/165)), downgrade the source and target Java versions by one, and try again until errors disappear.

### 🐅 Real-life example

My team owns a service that is deployed to AWS ECS, so we fully control the runtime environment specified as a Docker image. Although it is AWS, we see no benefits from using Amazon Corretto, defaulting to OpenJDK instead:

```
FROM ubuntu:23.04

...

RUN wget $JDK_DOWNLOAD_LINK \
  && tar -zxf openjdk-${JDK_VERSION}_linux-x64_bin.tar.gz \
  && ln -s jdk-${JDK_VERSION} java \
  && rm -f openjdk-${JDK_VERSION}_linux-x64_bin.tar.gz
```

The service is in very active development (10+ merge requests per day), so we upgrade the Java version every six months to every new feature release and sometimes do minor upgrades as a drill exercise. The current setup requires someone to update the base Docker image manually:

```
ENV JDK_VERSION=21
ENV JDK_DOWNLOAD_LINK="https://download.java.net/java/GA/jdk21/fd2272bbf8e04c3dbaee13770090416c/35/GPL/openjdk-21_linux-x64_bin.tar.gz"
```

Later, the Renovate bot picks up a new version of the base image and upgrades it everywhere:

![](/blog/java-version-upgrade-is-quite-simple/04.png)

Our automated tests suite ensures this update does not cause regressions, so we are always confident in releasing it to production without any special handling.

It probably makes sense for us to migrate to the Eclipse Temurin base image, and it will eliminate the manual work of updating the Java download link, as Renovate will be able to do it as well:

```
- FROM ubuntu:23.04
+ FROM eclipse-temurin:21

...

- ENV JDK_VERSION=21
- ENV JDK_DOWNLOAD_LINK="https://download.java.net/java/GA/jdk21/fd2272bbf8e04c3dbaee13770090416c/35/GPL/openjdk-21_linux-x64_bin.tar.gz"

- RUN wget $JDK_DOWNLOAD_LINK \
-  && tar -zxf openjdk-${JDK_VERSION}_linux-x64_bin.tar.gz \
-  && ln -s jdk-${JDK_VERSION} java \
-  && rm -f openjdk-${JDK_VERSION}_linux-x64_bin.tar.gz
```

Image size is not critical for us, so we don’t invest in reducing it. Moreover, we also install some debug tools into it, like [async-profiler](https://github.com/async-profiler/async-profiler):

```
# renovate: datasource=github-releases depName=jvm-profiling-tools/async-profiler versioning=semver-coerced
ENV ASYNC_PROFILER_VERSION=v2.9

RUN mkdir /opt/async-profiler \
  && cd /opt/async-profiler \
  && ASYNC_PROFILER_SEMVER=`echo "$ASYNC_PROFILER_VERSION" | tr -d v` \
  && wget https://github.com/jvm-profiling-tools/async-profiler/releases/download/${ASYNC_PROFILER_VERSION}/async-profiler-${ASYNC_PROFILER_SEMVER}-linux-x64.tar.gz \
  && tar -zxf async-profiler-${ASYNC_PROFILER_SEMVER}-linux-x64.tar.gz --strip-components=1 \
  && rm async-profiler-${ASYNC_PROFILER_SEMVER}-linux-x64.tar.gz
```

We use the same image to build the code and run the tests. Although debug tools may seem redundant for build image, having a single one significantly simplifies maintenance for us without serious issues or risks.

To ensure consistency of development environments, we use [SDKMAN](https://sdkman.io/). Without it, after every upgrade local build will break for every one of almost 100 of our contributors because older local JDK will not recognize the newer Java version. It is nearly impossible to manually manage local environment updates for every engineer, so instead our development environment setup script installs SDKMAN:

```
is_command_installed sdk || { curl -s "https://get.sdkman.io" | bash ; }
```

and makes sure it is properly configured to switch JDK versions automatically when you cd into the project directory (the config file should have `sdkman_auto_env=true` line):

```
SDKMAN_CONFIG=~/.sdkman/etc/config
if ( test -f $SDKMAN_CONFIG && grep -qxF "sdkman_auto_env=true" $SDKMAN_CONFIG ) ; then
  echo "'sdk' auto_env config [OK]"
else
  echo "'Setting 'sdkman_auto_env=true'."
  if ( ! test -f $SDKMAN_CONFIG || ! grep -qF "sdkman_auto_env" $SDKMAN_CONFIG ) ; then
    echo "sdkman_auto_env=true" >> $SDKMAN_CONFIG
  else
    if ( test -f $SDKMAN_CONFIG && grep -qxF "sdkman_auto_env=false" $SDKMAN_CONFIG ) ; then
      sed -i .bak 's/sdkman_auto_env=false/sdkman_auto_env=true/g' $SDKMAN_CONFIG
    fi
  fi
fi
```

With such a configuration, the environment is managed by the `.sdkmanrc` file in the project repo. To update everyone’s environment, all we need to do is:

![](/blog/java-version-upgrade-is-quite-simple/05.png)

and after this change is merged, SDKMAN will automatically download and install OpenJDK 21 on everyone's local environment.

As for the Java language source and target versions, we were stuck for a long time on Java 18 even running OpenJDK 20 in production. Two main offenders - [Guice](https://github.com/google/guice) and [Test Retry Gradle plugin](https://github.com/gradle/test-retry-gradle-plugin) were failing our tests on Java 19 with a bunch of:

```
java.lang.IllegalArgumentException: Unsupported class file major version
```

We also publish a small library and for it we use source and target compatibility with the previous LTS version 17. We will likely keep it for at least 9-12 months before considering upgrading to 21 to give time to consumers for an upgrade.

Recently we migrated from Guice to Spring and also the Test Retry plugin maintainers responded swiftly to [my report](https://github.com/gradle/test-retry-gradle-plugin/issues/165):

![](/blog/java-version-upgrade-is-quite-simple/06.png)

So we are moving fast from Java 18 right into Java 21 right now. Java 21 caused us some problems with the [Dependency Analysis Gradle Plugin](https://github.com/autonomousapps/dependency-analysis-gradle-plugin):

![](/blog/java-version-upgrade-is-quite-simple/07.png)

But upgrade to the latest version fixed it:

![](/blog/java-version-upgrade-is-quite-simple/08.png)

To be on the safer side, it makes more sense to update the target version first, wait for 1-2 weeks to see if there are any problems and then update the source version. It will ensure that no one will use new language features that you will need to revert in case rollback is required.

So just a month after the release we are fully compatible with Java 21 and can start waiting for the Java 22 release:

![](/blog/java-version-upgrade-is-quite-simple/09.png)

### 😵 It wasn’t that simple!

If you feel like you should not spend that much effort on the question about the Java version - just always use [Eclipse Temurin](https://adoptium.net/temurin/releases/) distribution of the LTS version that was actual one year ago, and you will always be good. Sorry for wasting your time for three weeks 🙈
