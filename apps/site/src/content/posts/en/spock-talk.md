---
title: "What Mr. Spock would possibly say about modern unit testing: pragmatic and emotional overview"
canonicalSlug: "spock-talk"
language: "en"
publishedAt: 2016-11-08
summary: "A long-form companion to the JEEConf 2016 talk: a tour through Spock framework features compared to JUnit, JUnit 5, TestNG, Hamcrest, AssertJ and Mockito — with the pragmatic and emotional answer to whether you should use Spock in 2016."
tags:
  - testing
  - groovy
  - jvm
translations:
  en: "spock-talk"
---
*Originally written 2016-11-08 as the long-form companion to my [JEEConf 2016 talk](/en/talks/spock-jeeconf-2016/). Preserved here as an archive — tooling versions and library positions reflect that era (JUnit 5 was a milestone release; Spock 1.1 was on the way). The Mr. Spock framing has aged better than the JUnit version numbers.*

*Code samples are the actual tagged regions from [yermilov/spock-talk](https://github.com/yermilov/spock-talk) — open the repo for full file context.*

## Introduction

In this article we will try to examine current state of the automated testing concept in the Java world.
As a reference, we will go through basic and advanced spock-framework features and compare them with what JUnit4/JUnit5/TestNG/Hamcrest/AssertJ/Mockito/whatever can offer instead.
We will try to understand Spock philosophy and find out both pragmatic and emotional answer to the questions:
should I use spock-framework in the year of 2016?
how to convince my manager that "yes, we should"?
how to convince my teammates that "no, we shouldn't"?

All sources from examples can be found [here](https://github.com/yermilov/spock-talk).

## What's About Modern Unit Testing?

To my mind, automated testing is one of the most powerful software development concept suggested so far.
After receiving great attention as part of XP manifesto, it made possible to increase size of projects and complexity of code we are able to maintain by orders of magnitude.

[JUnit](http://junit.org/), started by Kent Beck and Erich Gamma, played key role in the development of the automated testing idea as it was one of the first ever and surely the most popular and influential automated testing library.

[TestNG](http://testng.org/), started by Cédric Beust, was inspired by JUnit and initiated to offer wider and more powerful range of functionalities than JUnit originally does, keeping the same general concept. Later, most of the TestNG initiatives were implemented by JUnit.

As [recent study](http://blog.takipi.com/the-top-100-java-libraries-in-2016-after-analyzing-47251-dependencies/) shows, JUnit is used by about amazingly 60% of Java projects and TestNG shows quite strong result of about 6%.

![Source: http://blog.takipi.com/the-top-100-java-libraries-in-2016-after-analyzing-47251-dependencies/](/blog/spock-talk/spock-11ca2.png)
*Source: [http://blog.takipi.com/the-top-100-java-libraries-in-2016-after-analyzing-47251-dependencies/](http://blog.takipi.com/the-top-100-java-libraries-in-2016-after-analyzing-47251-dependencies/)*

Both JUnit and TestNG shares the same framework architecture often called xUnit (surprisingly after SUnit and JUnit itself).
It's described best by two concepts: test structure and assertions.
As test structure obviously is set of features to describe tests organization, and assertion is a function that verifies the behavior (or the state) of the unit under test.
If we look at the most simple JUnit and TestNG tests we will found them quite similarly implementing both concepts:

**Easy JUnit start**
```java
import org.junit.Test;

import static org.junit.Assert.assertEquals;

    @Test // <1>
    public void arrayList_length_ind() {
        ArrayList<String> list = new ArrayList<>();
        list.add("we");
        list.add("all");
        list.add("love");
        list.add("junit");
        assertEquals(list.size(), 4); // <2>
    }
```

1. Test structure
2. Assertion

**Easy TestNG start**
```java
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;

    @Test // <1>
    public void arrayList_length_idm() {
        ArrayList<String> list = new ArrayList<>();
        list.add("we");
        list.add("all");
        list.add("love");
        list.add("testng");
        assertEquals(list.size(), 4); // <2>
    }
```

1. Test structure
2. Assertion

Actually, except for import statements, these code snippets are the same.
My feel is that, not arguing with all benefits of JUnit and TestNG, they both were frozen long time ago and no longer evolving.
JUnit is ready to overcome this problem with 5.0.0 release, scheduled for the end of 2016.
Spock recently has epochal 1.0 release and 1.1 is on the way (1.1-rc2 version is already out).
TestNG has only several 6.9.x releases with no significant changes in them.

![](/blog/spock-talk/article-034d5.png)

So, there are several possibilities for passionate developers to continue evolving their test automation instruments. Let's examine them shortly.

### JUnit 5

We can just wait until traditional tools will attempt to make revolutionary changes. Sounds not very promising, but sometimes miracles happen. [JUnit 5](http://junit.org/junit5/) is on the way to final release after [very successful crowdfunding campaign on Indiegogo](https://www.indiegogo.com/projects/junit-lambda#/).

For now we can already examine second milestone release, and we can see that after a great work of JUnit team we will get a fresh new look at how JUnit should be implemented.
The most significant change is introduction of solid testing backend model, but it's not a main topic of this article.
Let's better check how the simplest JUnit 5 test looks like.
How many changes you can see?

**Easy JUnit 5 start**
```java
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

    @Test // <1>
    public void arrayList_length_idm() {
        ArrayList<String> list = new ArrayList<>();
        list.add("we");
        list.add("all");
        list.add("love");
        list.add("junit");
        list.add("5");
        assertEquals(5, list.size()); // <2> <3>
    }
```

1. Test structure
2. Assertion
3. Changes!

### Testing on Steroids

We can use one of plenty libraries that boost test code quality: [Hamcrest](http://hamcrest.org/JavaHamcrest/) (used by ~4% Java projects), [AssertJ](http://joel-costigliola.github.io/assertj/) (used by ~3% Java projects), [Google Truth](http://google.github.io/truth/) for assertions; [Mockito](http://mockito.org/) (used by ~10% Java projects), [PowerMock](https://github.com/jayway/powermock) (used by ~1.5% Java projects), [JMockit](http://jmockit.org/), [EasyMock](http://easymock.org/) (used by ~3% Java projects) for mocking and stubbing and probably some others like [Spring Test](https://github.com/spring-projects/spring-framework/tree/master/spring-test) (used by ~6% Java projects).

Actually I hope in the year 2016, no one is writing tests that looks like ones I've already shown.
As a base rule, they should be at least two steps forward: test should have clear inner structure and assertion should clearly explain its intent:

**Easy, but idiomatic JUnit start**
```java
    @Test // <1>
    public void arrayList_length_idm() {
        // setup // <2>
        ArrayList<String> list = new ArrayList<>();

        // run // <2>
        list.add("we");
        list.add("all");
        list.add("love");
        list.add("junit");

        // verify // <2>
        assertThat(list, hasSize(4)); // <3>
    }
```

1. Outer test structure
2. Inner test structure
3. Assertion

### Spock

Finally, we can make really big step forward and try completely new testing approach - [Spock](http://docs.spockframework.org/) - test framework developed by Peter Niederwleser and Luke Daley.
Spock is greatly inspired by Groovy language philosophy and used Groovy dynamic nature a lot.
But the same as with Gradle, where you do not need to know Groovy to develop build scripts, here you need to know almost nothing about Groovy to use Spock.
If you treat Spock like separate test-specific language and learn its main concepts, you can easily use them in conjunction with plain old Java code.

As big steps are much more effective when they are done immediately, here is a very simple Spock test.
If you write tests that looks like the last example, it will be very simple for you to get what is going on there:

**Easy Spock start**
```groovy
import spock.lang.Specification

class N04S_EasyStart extends Specification { // <1>

    def arrayList_length() { // <1>
        setup: // <2>
        ArrayList<String> list = new ArrayList<>();

        when: // <2>
        list.add("we");
        list.add("will");
        list.add("love");
        list.add("spock");

        then: // <2>
        assertThat(list, hasSize(4)); // <3>
    }

}
```

1. Outer test structure
2. Inner test structure
3. Assertion

## Why Try Spock?

Why someone should try to use Spock on their projects?
In the following sections I will demonstrate all benefits that can be gained from Spock usage.
Additionally, I will show drawbacks of such decision.
But despite both pros and cons there are two reasons why everyone should try Spock at least for their pet projects and later evaluate if it will be useful for the real ones:

- **Spock is the next generation test framework**. What does it mean? Spock takes all the years of automated testing experience and pain and re-imagine how it should be implemented if we look at it from a different angle.
_What if_ we do not need to use the same language for testing as we use for production code?
_What if_ it can be language designed for testing specifically?
_What if_ test context can be moved from comments to code?
_What if_ there are different testing approaches and we should offer convenient features for all of them?
Spock asks plenty of _What if?_ questions and based on them re-implement well-known testing approach in another (arguably better) way.

- **Spock is enterprise ready**. Spock is more than 6 years old. Spock is already released 1.0 version and has stable API.
It's completely mature framework that can be safely used without any fears.

## How To Start With Spock?

![](/blog/spock-talk/spock-8eb85.png)

As you can already see, it's more than easy to start using Spock.
Begin with adding these three dependencies to your project:

```groovy
'org.spockframework:spock-core:1.1-groovy-2.4-rc-2'
'cglib:cglib-nodep:3.2.2'
'org.objenesis:objenesis:2.4'
```

If you already have test code you want to migrate to Spock either from JUnit of TestNG take there five easy steps:

**Rename your test files from `**.java` to `**.groovy` and move them to `src/test/groovy` directory.**
**Extend your test class form `spock.lang.Specification` class.**
**Remove all `@Test` annotations and change return type for all test methods to `def`.**
**Enforce inner test structure by using following labels: `setup` for test object setting up, `when` for test actions and `then` for assertions.**
**Enjoy becoming a Spock developer in less than 15 minutes.**

However, if you are starting from scratch, you will probably want to write more idiomatic Spock code.
The first step towards this goal is start using Spock assertions.

## Spock Assertions

![](/blog/spock-talk/spock-f1523.png)

In the first place, each test framework offers two simple assertion constructions: `assertEquals` checks for equality of two objects and `assertTrue` checks if specified expression is true. However, using such constructions has two critical drawbacks:

- when test fails, it's hard to understand why it has failed;
- test code is not maintainable, as it's not obvious what was the intent behind each assertion.

Just try to look at following test failure logs and guess what is tested and why tests have failed:

```groovy

        assertEquals(list.size(), 3);
//        java.lang.AssertionError:
//        Expected :4
//        Actual   :3

        assertTrue(list.size() == 3);
//        java.lang.AssertionError
//        at org.junit.Assert.fail(Assert.java:86)
//        at org.junit.Assert.assertTrue(Assert.java:41)
//        at org.junit.Assert.assertTrue(Assert.java:52)
```

That's why it is so important to use external assertion library.
The most popular one, Hamcrest, clearly shows intent behind assertion both in the test code and in the failure message:

```groovy
import static org.hamcrest.Matchers.hasSize
import static org.junit.Assert.assertThat

        assertThat(list, hasSize(3));
//        java.lang.AssertionError:
//        Expected: a collection with size \<3>
//        but: collection size was \<4>
```

Two libraries that are less popular, AssertJ and Google Truth, shows not only the assertion intent but also describe some part of the test context that lead to the failure:

```groovy
import com.google.common.truth.Truth
import org.assertj.core.api.Assertions

        Assertions.assertThat(list).hasSize(3);
//        java.lang.AssertionError:
//        Expected size:<3> but was:<4> in:
//        <["we", "will", "love", "spock"]>

        Truth.assertThat(list).hasSize(3);
//      java.lang.AssertionError: Not true that <[we, will, love, spock]> has a size of <3>. It is \<4>
```

Original Spock assertions show a little intent behind their code, but they are not less than perfect in demonstrating test context that lead to the failure. Moreover, all you need to start using them is to place boolean expression inside `then` block:

```groovy

        then:
        list.size() == 3
//        Condition not satisfied:
//
//        list.size() == 3
//        |    |      |
//        |    4      false
//        [we, will, love, spock]
```

Just look how useful they are when we need to examine some complex data flow:

![](/blog/spock-talk/spock-4f14e.png)

But in combination with well-known Hamcrest matchers, Spock assertions provide 100% needed information from both test code and test failure reports:

```groovy
import static spock.util.matcher.HamcrestSupport.expect

        then:
        expect list, hasSize(3)
//        Condition not satisfied:
//
//        expect list, hasSize(3)
//        |      |
//        false  [we, will, love, spock]
//
//        Expected: a collection with size \<3>
//        but: collection size was \<4>
```

Spock assertions were so successful that they were ported to plain Groovy, which means that if you use JUnit or TestNG you can write you code in Groovy, immediatelly getting Spock assertions in your old-fashioned tests:

```groovy
    @Test
    void 'ArrayList.size()'() {
        // setup
        ArrayList<String> list = new ArrayList<>()

        // run
        list.add 'we'
        list.add 'will'
        list.add 'love'
        list.add 'spock'

        // verify
        assert list.findAll({ it.length() < 5 }) == list.drop(2)
//        Assertion failed:
//
//        assert list.findAll({ it.length() < 5 }) == list.drop(2)
//        |    |                            |  |    |
//        |    [we, will, love]             |  |    [love, spock]
//        [we, will, love, spock]           |  [we, will, love, spock]
//        false
    }
```

## Test Structure

![](/blog/spock-talk/spock-f032e.png)

As it was already mentioned, the second main part of every testing framework is test structure toolset.
Traditional approach is pretty much the same:

**JUnit test structure toolset**
```groovy
import org.junit.After
import org.junit.AfterClass
import org.junit.Before
import org.junit.BeforeClass
import org.junit.Test

    static Sql sql // <1>

    @BeforeClass // <2>
    public static void createTable() {
        sql = Sql.newInstance("jdbc:h2:mem:", "org.h2.Driver")
        sql.execute("create table testing_tool (id int primary key, name varchar(100), version varchar(100))")
    }

    @Before // <3>
    public void insertBasicData() {
        sql.execute("insert into testing_tool values (1, 'junit', '4.12'), (2, 'spock', '1.0'), (3, 'testng', '6.9.10')")
    }

    @Test // <4>
    public void toolCount() {
        // run
        def actual = sql.firstRow("select count(*) as toolCount from testing_tool")

        // verify
        assertThat(actual.toolCount, is(3L))
    }

    @After // <5>
    public void cleanTable() {
        sql.execute("delete from testing_tool")
    }

    @AfterClass // <6>
    public static void dropTable() {
        sql.execute("drop table testing_tool")
        sql.close()
    }
```

1. Shared resource
2. Executed once before all test cases
3. Executed before each test case
4. Test case
5. Executed after each test case
6. Executed once after all test cases

**TestNG test structure toolset**
```groovy
import org.testng.annotations.AfterClass
import org.testng.annotations.AfterMethod
import org.testng.annotations.BeforeClass
import org.testng.annotations.BeforeMethod
import org.testng.annotations.Test

    static Sql sql // <1>

    @BeforeClass // <2>
    public static void createTable() {
        sql = Sql.newInstance("jdbc:h2:mem:", "org.h2.Driver")
        sql.execute("create table testing_tool (id int primary key, name varchar(100), version varchar(100))")
    }

    @BeforeMethod // <3>
    public void insertBasicData() {
        sql.execute("insert into testing_tool values (1, 'junit', '4.12'), (2, 'spock', '1.0'), (3, 'testng', '6.9.10')")
    }

    @Test // <4>
    public void toolCount() {
        // run
        def actual = sql.firstRow("select count(*) as toolCount from testing_tool")

        // verify
        assertEquals(actual.toolCount, 3L)
    }

    @AfterMethod // <5>
    public void cleanTable() {
        sql.execute("delete from testing_tool")
    }

    @AfterClass // <6>
    public static void dropTable() {
        sql.execute("drop table testing_tool")
        sql.close()
    }
```

1. Shared resource
2. Executed once before all test cases
3. Executed before each test case
4. Test case
5. Executed after each test case
6. Executed once after all test cases

**JUnit 5 test structure toolset**
```groovy
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

    static Sql sql

    @BeforeAll
    public static void createTable() {
        sql = Sql.newInstance("jdbc:h2:mem:", "org.h2.Driver")
        sql.execute("create table testing_tool (id int primary key, name varchar(100), version varchar(100))")
    }

    @BeforeEach
    public void insertBasicData() {
        sql.execute("insert into testing_tool values (1, 'junit', '4.12'), (2, 'spock', '1.0'), (3, 'testng', '6.9.10')")
    }

    @Test
    public void toolCount() {
        // run
        def actual = sql.firstRow("select count(*) as toolCount from testing_tool")

        // verify
        assertEquals(3L, actual.toolCount)
    }

    @AfterEach
    public void cleanTable() {
        sql.execute("delete from testing_tool")
    }

    @AfterAll
    public static void dropTable() {
        sql.execute("drop table testing_tool")
        sql.close()
    }
```

1. Shared resource
2. Executed once before all test cases
3. Executed before each test case
4. Test case
5. Executed after each test case
6. Executed once after all test cases

Here is one important thing about Spock philosophy as project.
**If you do like traditional approach you can continue using it. Spock will just add some fancy Groovy magic to make it better**.
In this concrete case, you can use [Groovy traits](http://docs.groovy-lang.org/next/html/documentation/core-traits.html) to extract repeatable setup/cleanup behavior and reuse it easily across your test classes:

**Spock reusable test structure via traits**
```groovy
import groovy.sql.Sql

trait DatabaseSpec {

    static Sql sql // <1>

    def setupSpec() { // <2>
        sql = Sql.newInstance("jdbc:h2:mem:", "org.h2.Driver")
        sql.execute("create table testing_tool (id int primary key, name varchar(100), version varchar(100))")
    }

    def setup() { // <3>
        sql.execute("insert into testing_tool values (1, 'junit', '4.12'), (2, 'spock', '1.0'), (3, 'testng', '6.9.10')")
    }

    def cleanup() { // <4>
        sql.execute("delete from testing_tool")
    }

    def cleanupSpec() { // <5>
        sql.execute("drop table testing_tool")
        sql.close()
    }
}
```

1. Shared resource
2. Executed once before all test cases
3. Executed before each test case
4. Executed after each test case
5. Executed once after all test cases

To inject this behavior to your test specification, just implement all traits you need:

**Spock test structure toolset**
```groovy
class N11S_SetupTeardown_AsYouLike extends Specification implements DatabaseSpec {

    def 'tool count'() {
        when: 'we count number of unit testing tools'
        def actual = sql.firstRow("select count(*) as toolCount from testing_tool")

        then: 'it should be 3'
        actual.toolCount == 3
    }
```

And here is one more important thing about Spock philosophy as project.
**Spock always offers more!**
Let's examine the following:

**Spock more test structure toolset**
```groovy

    @Shared @AutoCleanup sql // <1> <2>

    def 'JUnit5 is in game!'() {
        setup: 'add JUnit 5 to the list of unit testing tools' // <3>
        sql.execute("insert into testing_tool values (4, 'junit', '5')")

        when: 'we count number of JUnits'
        def actual = sql.firstRow("select count(*) as toolCount from testing_tool where name = 'junit'")

        then: 'it should be 2'
        actual.toolCount == 2

        cleanup: 'remove JUnit 5 from the list of unit testing tools' // <4>
        sql.execute("delete from testing_tool where id = 4")
    }
```

1. Instead of using `static` keyword for shared resources use `@Shared` annotation
2. `@AutoCleanup` annotation invokes close method of the shared resource after each test case
3. Tests can have individual setup blocks
4. Tests can have individual cleanup blocks

Let's look at `@Shared` annotation closely.
It will demonstrate why it's so important to use test-specific language for your tests instead of general-purpose language like Java.
When you develop your test (but not only test) code, each time you try to find language feature that suites best your need.
For example, if you need to share some resource within test class and you use Java, natural choice will be `static`.
But, what if you want to do the same in several test classes? You can extract this behavior to superclass like following:

**`static` field for resource sharing**
```groovy
class N14S_SharedExplained_BasicStatic extends Specification {

    static List arrayList = new ArrayList<String>()
}

@Stepwise
class N14S_SharedExplained_Static_1 extends N14S_SharedExplained_BasicStatic {

    def 'static ArrayList and junit'() {
        when:
        N14S_SharedExplained_BasicStatic.arrayList.add('junit')

        then:
        N14S_SharedExplained_BasicStatic.arrayList.size() == 1
    }

    def 'static ArrayList and spock'() {
        when:
        N14S_SharedExplained_BasicStatic.arrayList.add('spock')

        then:
        N14S_SharedExplained_BasicStatic.arrayList.size() == 2
    }
}

class N14S_SharedExplained_Static_2 extends N14S_SharedExplained_BasicStatic {

    def 'static ArrayList and testng'() {
        when:
        N14S_SharedExplained_BasicStatic.arrayList.add('junit')

        then:
        N14S_SharedExplained_BasicStatic.arrayList.size() == 1
    }
}
```

If you look carefully, you will find that some of these tests will fail.
Single resource will be shared between all three test cases and you have no control over it.

Spock, as test-specific language, can keep in mind needs of test code developers and offer features that gives you more control on test code behavior.
In this example `@Shared` annotation clearly will share resource only within single specification. Our example is fixed:

**`@Shared` field for resource sharing**
```groovy
class N14S_SharedExplained_BasicShared extends Specification {

    @Shared
            arrayList = new ArrayList<String>()
}

@Stepwise
class N14S_SharedExplained_Shared_1 extends N14S_SharedExplained_BasicShared {

    def 'shared ArrayList and junit'() {
        when:
        arrayList.add('junit')

        then:
        arrayList.size() == 1
    }

    def 'shared ArrayList and spock'() {
        when:
        arrayList.add('spock')

        then:
        arrayList.size() == 2
    }
}

class N14S_SharedExplained_Shared_2 extends N14S_SharedExplained_BasicShared {

    def 'shared ArrayList and testng'() {
        when:
        arrayList.add('junit')

        then:
        arrayList.size() == 1
    }
}
```

## Inner Test Structure

To my mind, the most important Spock feature comparing to other test frameworks (that do not have anything similar) is **enforcing inner test structure**.
While it's generally a good practice to set up inner test structure using comments, Spock provides language features that make you do it.
It's really great design decision, because comments, as they are not natural part of the code, becomes outdated very quickly.
When something is part of the code, it is always up to date.
Let's look at the example:

**Spock inner test structure**
```groovy
import spock.lang.Issue
import spock.lang.Narrative
import spock.lang.Specification
import spock.lang.Subject
import spock.lang.Title

@Title('ArrayList tests') // <1>
@Narrative('''
As Java developer
(that trust nothing)
I want to be sure ArrayList works
''') // <2>
@Report
class N07S_IdiomaticSpock extends Specification {

    @Subject // <3>
    ArrayList<String> list

    @Issue('https://github.com/yermilov/spock-talk/issues/1') // <4>
    def 'ArrayList.size()'() {
        setup: 'new ArrayList instance' // <5>
        list = new ArrayList<>()

        expect: 'that newly created ArrayList instance is empty' // <6>
        list.empty

        when: 'add value to list' // <7>
        list.add 'we'

        and: 'add one more value to list' // <8>
        list.add 'will'

        then: 'array list size should be 2' // <9>
        list.size() == 2

        when: 'add two more values into list'
        list.add 'love'
        list.add 'spock'

        then: 'array list size should be 4'
        list.size() == 4

        and: 'list contains all needed values'
        list == [ 'we', 'will', 'love', 'spock' ]
    }
}
```

1. Title gives short name of what is going on within this test suite
2. Narrative is the text describing specification
3. Subject points on object under test
4. Issue describes issues connected with the test case
5. You are already familiar with `setup` block, but pay attention on string (not comment!) that follows each test block describing what is going on inside it
6. `expect` block contains set of conditions that all should evaluate to `true`
7. `when` block contains set of actions on object under test
8. `and` block helps to split sets under `when` or `then` blocks
9. `then` block contains set of conditions that all should evaluate to `true` after previous `when` block

Great follow-up from the fact that test structure becomes part of the test code is that this information becomes available at runtime.
Projects like [Spock reports](https://github.com/renatoathaydes/spock-reports) leverage this information and, for example, generate very detailed reports based on it.
Just look at test report that is ready to publish for your team non-development folks:

![](/blog/spock-talk/spock-f353a.png)

All you need to do is add following code to your build file:

```groovy
testCompile('com.athaydes:spock-reports:1.2.10') {
    transitive = false // this avoids affecting your version of Groovy/Spock
}
```

## Data Driven Tests

![](/blog/spock-talk/spock-b7d45.png)

To my mind, while the previous feature is greatest and the most unappreciated Spock feature, this one is the most famed one.
Surely, it's very powerful, but it's needed only for some specific cases, while inner test structure is generally applicable.
I'm talking about data driven tests. Let's look at quick example:

**Complex data driven test**
```groovy

    def 'is coin flip good enough for determine if integer is prime'() {
        when: 'we flip a coin'
        boolean coinFlip = new Random().nextBoolean()

        then: 'it will be great if coin flip predict if number is prime'
        (number % 2 == 0 ? false : coinFlip) == expectedAnswer // <4>

        where: 'data is random' // <1>
        number << (1..5).collect({ new Random().nextInt(1000) }).findAll({ it >= 2 }).sort() // <2>
        expectedAnswer = Primes.isPrime(number) // <3>
    }
```

1. `where` is new test block used for defining variables that work as multiple test parameters for same test scenario
2. Test parameter can be defined as collection of values
3. Or just as assignment rule
4. Defined test parameters can be used as regular variables inside other test blocks

This example shows _complex_ test case, when the same scenario is run against multiple test parameters within same equivalence class.
Test is considered as passed if and only if test scenario passes all test parameters.
Here is how test report looks for this case:

![](/blog/spock-talk/spock-1dd56.png)

Another use case supported by Spock is reusing same test code for test cases from different equivalence class.
Here is example that demonstrate this and some other concepts:

**Dividual data driven test**
```groovy

    @Unroll // <1>
    def 'calculate runner speed and location after some time for #description'() { // <2>
        expect: 'that runner speed is equal to expected'
        speed0 + accl * time == speed1

        and: 'runner location is equal to expected'
        coord0 + time * (speed0 + accl / 2 * time) == coord1

        where: 'there are set of precalculated data for different situations' // <3>
        coord0 | speed0 | accl | time || coord1 | speed1 || description
        0      | 6      | 0    | 10   || 60     | 6      || 'steady run from starting point'
        5      | 0      | 3    | 3    || 17     | 9      || 'start from still with acceleration'
        -50    | 10     | -1   | 10   || 0      | 0      || 'constant deceleration'
    }
```

1. `@Unroll` annotation turns complex test case into dividual one
2. test parameters can be used inside test name with `#` mark
3. test parameters can be organized into fancy tables

This example shows _dividual_ test cases, when test representation is separated from test code.
Each test parameter generate individual test case, that shares the same code, but not test result, with others.
Here is how test report looks for this case:

![](/blog/spock-talk/spock-997c6.png)

Traditional test frameworks mix up both concepts, and moreover provide very poor language support for data-driven test:

**JUnit data driven test**
```java
@RunWith(Parameterized.class)
public class N16J_DataProviders {

    @Parameterized.Parameters(name = "calc runner speed and location after some time for {6}")
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][] {
            { 0.0,   6.0,  0.0,  10.0, 60.0, 6.0, "steady run from starting point" },
            { 5.0,   0.0,  3.0,  3.0,  17.0, 9.0, "starting from standing with acceleration" },
            { -50.0, 10.0, -1.0, 10.0, 0.0,  0.0, "constant deceleration"}
        });
    }

    @Parameterized.Parameter(value = 0)
    public double initialLocation;

    @Parameterized.Parameter(value = 1)
    public double initialSpeed;

    @Parameterized.Parameter(value = 2)
    public double acceleration;

    @Parameterized.Parameter(value = 3)
    public double time;

    @Parameterized.Parameter(value = 4)
    public double expectedLocation;

    @Parameterized.Parameter(value = 5)
    public double expectedSpeed;

    @Parameterized.Parameter(value = 6)
    public String description;

    @Test
    public void speed() {
        double speed = initialSpeed + acceleration * time;
        assertThat(speed, is(equalTo(expectedSpeed)));
    }
```
![](/blog/spock-talk/spock-b408e.png)

**TestNG data driven test**
```java
    @DataProvider(name = "data")
    public static Object[][] data() {
        return new Object[][] {
            { 0.0,   6.0,  0.0,  10.0, 60.0, 6.0 },
            { 5.0,   0.0,  3.0,  3.0,  17.0, 9.0 },
            { -50.0, 10.0, -1.0, 10.0, 0.0,  0.0 }
        };
    }

    @Test(dataProvider = "data")
    public void speed(double initialLocation, double initialSpeed, double acceleration, double time, double expectedLocation, double expectedSpeed) {
        double speed = initialSpeed + acceleration * time;
        assertEquals(speed, expectedSpeed);
    }
```
![](/blog/spock-talk/spock-25dc5.png)

Pay attention that using `Object[][]` is very unsafe and unclear for test parameters set up, and even more, that TestNG does not supports test naming easily.

What is interesting, JUnit 5 instead of having concept of data-driven tests, has more general and very powerful concept of dynamic tests.
It means that test cases can be generated at runtime, based on provided data and any other source:

**JUnit 5 dynamic test**
```java

    private static final Object[][] DATA = new Object[][] {
            { 0.0,   6.0,  0.0,  10.0, 60.0, 6.0, "steady run from starting point" },
            { 5.0,   0.0,  3.0,  3.0,  17.0, 9.0, "starting from standing with acceleration" },
            { -50.0, 10.0, -1.0, 10.0, 0.0,  0.0, "constant deceleration"}
    };

    @TestFactory
    public Stream<DynamicTest> speedTests() {
        return Arrays.stream(DATA).map(data -> dynamicTest(data[6].toString(), () -> {
            double initialSpeed = (double) data[1];
            double acceleration = (double) data[2];
            double time = (double) data[3];
            double expectedSpeed = (double) data[5];

            double speed = initialSpeed + acceleration * time;
            assertEquals(expectedSpeed, speed);
        }));
    }
```
![](/blog/spock-talk/article-549aa.png)

## Exceptions Handling

![](/blog/spock-talk/spock-aafec.png)

When you want to have a test case checking that exception is thrown for some particular scenario in your JUnit test suite, it is as easy as defining simple `@Test` parameter:

**JUnit simple thrown exception check**
```java

    @Test(expected = IndexOutOfBoundsException.class)
    public void exception_oldWay() {
        // setup
        ArrayList<Integer> arrayList = new ArrayList<>();

        // run
        arrayList.get(17);
    }
```

Thing become a little harder when you need to perform some additional checks, like exception message or stack trace:

**JUnit simple thrown exception message check**
```java

    @Test
    public void exceptionAndMessage_oldWay() {
        // setup
        ArrayList<Integer> arrayList = new ArrayList<>();

        // run
        try {
            arrayList.get(17);
            fail("Expected an IndexOutOfBoundsException to be thrown");
        } catch (IndexOutOfBoundsException exception) {
            // verify
            assertThat(exception.getMessage(), is("Index: 17, Size: 0"));
        }
    }
```

For both cases, Spock comes up with a very convenient way to catch thrown exception and do whatever you want to do with and check whatever you want to check:

**Spock thrown exception check**
```groovy

    def 'empty ArrayList has no 17th element'() {
        given: 'empty array list'
        def arrayList = new ArrayList<Integer>()

        when: 'we try to retrieve element with index #17'
        arrayList.get(17)

        then: 'exception is thrown with expected message'
        IndexOutOfBoundsException exception = thrown()
        exception.message == 'Index: 17, Size: 0'
    }
```

But what if you want to check that after some action exception was _not_ thrown?
The most simple way is just do nothing, as unexpected exception will cause test to fail:

**JUnit simple not-thrown exception check**
```java

    @Test
    public void noException_oldWay() {
        // setup
        ArrayList<Integer> arrayList = new ArrayList<>();

        // run
        arrayList.size();

        // verify no exception is thrown
    }
```

The problem with such approach is that if exception is _do_ thrown test will be marked not as _failed_ but as _error_.
If you do not like it, you should do something like:

**JUnit ugly not-thrown exception check**
```java

    @Test
    public void noException_uglyWay() {
        // setup
        ArrayList<Integer> arrayList = new ArrayList<>();

        // run
        try {
            arrayList.size();
        } catch (Exception exception) {
            // verify no exception is thrown
            fail("Expected no exception to be thrown");
        }
    }
```

What Spock do is, again, come up with very convenient way to declare that test intent is that exception should not be thrown.
Pay attention that it's done not through comment, but rather with language construction:

**Spock not-thrown exception check**
```groovy

    def 'large ArrayList has 17th element'() {
        given: 'list of 28 prime numbers'
        def arrayList = new ArrayList<Integer>()
        28.times { arrayList << Primes.nextPrime(arrayList.empty ? 1 : arrayList[-1]) }

        when: 'we try to retrieve element with index #17'
        arrayList.get(17)

        then: 'no exception is thrown'
        notThrown(IndexOutOfBoundsException)
    }
```

Of course, if you are familiar with [JUnit Rules API](https://github.com/junit-team/junit4/wiki/Rules), you surely can greatly improve JUnit solution:

**JUnit thrown exception check via Rules API**
```java

    @Rule
    public ExpectedException thrown = ExpectedException.none();

    @Test
    public void exception_modernWay() {
        // setup
        ArrayList<Integer> arrayList = new ArrayList<>();

        // expect
        thrown.expect(IndexOutOfBoundsException.class);
        thrown.expectMessage(is("Index: 17, Size: 0"));

        // run
        arrayList.get(17);
    }
```

JUnit 5 can do the same natively:

**JUnit 5 thrown exception check**
```java

    @Test
    public void exception() {
        // setup
        ArrayList<Integer> arrayList = new ArrayList<>();

        // run & verify
        Throwable thrown = expectThrows(IndexOutOfBoundsException.class, () -> { arrayList.get(17); });
        assertEquals("Index: 17, Size: 0", thrown.getMessage());
    }
```

What is very disappointing is that TestNG has a very limited, closed and ugly solution for the same problem.
If you want to check exception error message, you should supply expected regexp to `@Test` annotation:

**TestNG thrown exception check**
```java

    @Test(expectedExceptions = IndexOutOfBoundsException.class, expectedExceptionsMessageRegExp = "Index: 17, Size: 0")
    public void exception_oldWay() {
        // setup
        ArrayList<Integer> arrayList = new ArrayList<>();

        // run
        arrayList.get(17);
    }
```

## Mocking

![](/blog/spock-talk/spock-1abd2.png)

As you probably already notice from the study shown at the beginning, industry standard de facto for all mocking activities is Mockito library.
As usual, if you like it (and probably you do), you can continue using it with Spock.
And again Spock offers you its own solution which uses fancy Groovy magic to make mocking more pleasant for developers.

By the way, providing all needed functionality for any kind of testing approach is a great part of Spock philosophy, which is clearly shown by this example.

Let's now exam and compare Mockito and Spock solutions for various mocking tasks one by one:

### Stubs

Stubs are used when you need to replace some complex behavior of units you depends on by simple one, like returning constant value or throwing exception.

**Make stub to return value via Mockito**
```groovy
        given: 'random generator that always return 0'
        Random random = mock(Random)
        doReturn(0).when(random).nextInt(26)
```

**Make stub to return value via Spock**
```groovy
        given: 'random generator that always return 0'
        Random random = Stub()
        random.nextInt(26) >> 0
```

**Make stub to return consequent values via Mockito**
```groovy
        given: 'random generator that always return predefined values'
        Random random = mock(Random)
        doReturn(0).doReturn(1).doReturn(2).doReturn(3).doReturn(4).when(random).nextInt(26)
```

**Make stub to return consequent values via Spock**
```groovy
        given: 'random generator that always return predefined values'
        Random random = Stub()
        random.nextInt(_) >>> [ 0, 1, 2, 3, 4 ]
```

**Make stub to throw exception via Mockito**
```groovy
        given: 'random generator that always throw exception'
        Random random = mock(Random)
        doThrow(new RuntimeException()).when(random).nextInt(26)
```

**Make stub to throw exception via Spock**
```groovy
        given: 'random generator that always throw exception'
        Random random = Stub()
        random.nextInt(_) >> { throw new RuntimeException() }
```

**Make stub to perform some custom action via Mockito**
```groovy
        given: 'random generator that always return biggest possible value'
        Random random = mock(Random)
        doAnswer({ inv -> (int) inv.getArguments()[0] - 1}).when(random).nextInt(26)
```

**Make stub to perform some custom action via Spock**
```groovy
        given: 'random generator that always return biggest possible value'
        Random random = Stub()
        random.nextInt(_) >> { int max -> max - 1 }
```

### Mocks

Mocks are used when you need to monitor and verify interactions with units you depends on.

**Simple check how many times specified method was invoked via Mockito**
```groovy
        then: 'random generator is invoked 5 times'
        mockito verify(random, times(5)).nextInt(anyInt())
```

**Simple check how many times specified method was invoked via Spock**
```groovy
        then: 'random generator is invoked 5 times'
        5 * random.nextInt(_)
```

**More complex mocks verifications and order check via Mockito**
```groovy
        then: '''first random generator is invoked once to generate password length,
                 then at least 8 times more and it is never invoked for anything else'''
        InOrder inOrder = inOrder(random)
        mockito inOrder.verify(random, times(1)).nextInt(10)
        mockito inOrder.verify(random, atLeast(8)).nextInt(26)
        mockito inOrder.verifyNoMoreInteractions()
```

**More complex mocks verifications and order check via Spock**
```groovy
        then: 'first random generator is invoked once to generate password length'
        1 * random.nextInt(10)

        then: 'then random generator is invoked at least 8 times more'
        (8.._) * random.nextInt(_)

        then: 'random generator is never invoked for anything else'
        0 * random._
```

One small detail is that for using Mockito invocations inside `then` block you need to make them always return true, because as failure is signaled by throwing exceptions, Spock can misinterpret value returned by Mockito.
This issue is simply fixed by adding following method to your specifications:

**Just use `mockito {mockitoMethod}` for all Mockito interactions**
```groovy
    static def mockito(def verify) {
        true
    }
```

### Spies

Spies are used when you need to monitor and verify interactions with unit you are testing.
The difference is that mocks are used to fake unit behavior and monitor its usage, while spies monitors without changing original behavior.

**Check method arguments values via Mockito**
```java
        ArgumentCaptor<Integer> argument = ArgumentCaptor.forClass(Integer.class);
        verify(passwordGenerator).generate(argument.capture());
        assertThat(argument.getValue(), is(greaterThanOrEqualTo(8)));
        assertThat(argument.getValue(), is(lessThan(18)));
```

**Check method arguments values via Spock**
```groovy
        then: 'it tries to generate password of length from 8 to 17'
        1 * passwordGenerator.generate({ it >= 8 && it < 18 })
```

As Spock is used for testing Groovy code, which is dynamic, some available checks have a little sense for Java and Mockito:

**Check that method argument is not `null` via Spock**
```groovy
        then: 'it tries to generate password of some not-null length'
        1 * passwordGenerator.generate(!null)
```

**Check method argument type via Spock**
```groovy
        then: 'it tries to generate password of some integer length'
        1 * passwordGenerator.generate(_ as Integer)
```

### Static and final methods, constructors

Besides traditional and best-practice features, Spock offers more.
Yes, they are bad practices, but who lives in ideal world?
If needed you can stub, mock or spy on `static` and/or `final` methods:

**Spying on `static final` method via Spock**
```groovy
    def 'static final mocking'() {
        given: 'we can mock *static* method of *final* class java.lang.Math'
        GroovySpy(Math, global: true)
        1 * Math.abs(_) >> 28

        expect: 'a miracle happens'
        Math.abs(17) == 28
    }
```

You also can mock constructor call.

**Mocking `new String()` via Spock**
```groovy
    def 'constructor mocking'() {
        given: 'we can mock constructor of *final* class java.lang.String'
        GroovySpy(String, global: true)
        new String(_) >> new String('boom!')

        expect: 'a miracle happens'
        new String('WAT') == 'boom!'
    }
```

_With great power comes great responsibility_ is a very good citation for this case.

Given a very concise mocking syntax in Spock, another citation is also very good to remember:

**Valid Spock code, ladies and gentlemen!**
```groovy
    def 'syntax bomb'() {
        when: 'mocking goes to far'
        Mock(Random)

        then: '''that guy who ends up maintaining
                 your code will be a violent psychopath
                 who knows where you live'''
        (_.._) * _.(_) >> _
    }
```

## Timing features

![](/blog/spock-talk/spock-4bf7a.png)

### Asserting changes

If you need to check how some value has changed after execution of test scenario, traditional and reasonable approach is to save it before and after execution to compare afterwards:

**Asserting changes without Spock**
```groovy
    @Test
    public void 'modifying data in table'() {
        // run
        def old = sql.firstRow("select count(*) as toolCount from testing_tool").toolCount
        sql.execute("insert into testing_tool values (4, 'junit', '5')")
        def actual = sql.firstRow("select count(*) as toolCount from testing_tool").toolCount

        // verify
        assertThat(actual, is(old + 1))
    }
```

For this case, Spock has introduced small but very useful feature. You can wrap any variable or method invocation by `old()` inside `then` block and it will be replaced by the corresponding value **before execution of previous `when` block**:

**Asserting changes with Spock**
```groovy
    def 'modifying data in table'() {
        when: 'add JUnit 5 to the list of unit testing tools'
        sql.execute("insert into testing_tool values (4, 'junit', '5')")

        then: 'number of tools should be incremented'
        sql.firstRow("select count(*) as toolCount from testing_tool").toolCount ==
                old(sql.firstRow("select count(*) as toolCount from testing_tool").toolCount) + 1

    }
```

### Timeouts

Test timeouts are implemented very similarly in both JUnit and TestNG:

**Test timeouts via JUnit**
```java
    @Test(timeout = 2000)
    public void infiniteLoop() {
        // setup
        ArrayList<String> arrayList = new ArrayList<>();

        // run
        while (true) { arrayList.add("junit forever!"); }
    }
```

**Test timeouts via TestNG**
```java
    @Test(timeOut = 2000)
    public void infiniteLoop() {
        // setup
        ArrayList<String> arrayList = new ArrayList<>();

        // run
        while (true) { arrayList.add("testng forever!"); }
    }
```

Really, it's hard to improve something there besides arguing is it 'timeout' or 'time out'.
But as test code readability is one of main Spock goals, there is an obvious improvement for it:

**Test timeouts via Spock**
```groovy
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    def 'infinite loop'() {
        setup: 'array list'
        def arrayList = new ArrayList<String>()

        expect: 'we will add to it values forever'
        while (true) { arrayList.add('spock forever!') }
    }
```

### Testing async code

While two previous features were so small and minor, the next one is really important.
How can we test async code? Let's forget for now that is should be turned to synchronous before testing.
Sometime it's impossible, sometimes it's not reasonable.
The most simple and the most strange approach is just ignoring that code is async:

**Testing async code using ignorance**
```groovy
    @Test
    void iWantToBelieve() {
        // setup
        Integer actual = null

        // run
        asyncNextPrime( 1728, { answer -> actual = answer } )

        // verify
        assert actual == 1733
    }
```

Of course, such approach will not work in slightly more than 100% cases.
The most obvious improvement is to add some reasonable delay before asserting async result:

**Testing async code using sleeping**
```groovy
    @Test
    void hm() {
        // setup
        Integer actual = null

        // run
        asyncNextPrime( 1728, { answer -> actual = answer } )

        // hm
        Thread.sleep(3000)

        // verify
        assert actual == 1733
    }
```

While it will work sometimes, such approach has two problems: sometimes async call will finish long time before delay does and this time will be wasted, and sometimes async call will last a little longer than delay does and the test will fail.
The more intelligent approach is to add some logic to check if async call is finished:

**Testing async code using more intelligent approach**
```groovy
    @Test(timeout = 3000L)
    void complicatedHm() {
        // setup
        Integer actual = null

        // run
        asyncNextPrime( 1728, { answer -> actual = answer } )

        // hmhm
        while (actual == null) {
            if (actual != null) {
                // verify
                assert actual == 1733
            }
        }
    }
```

The problem of this approach is that, actually, it's a very clear test code anti-pattern. For many reasons, keeping non-linear logic in test code reduces tests reliability a lot.

Spock suggests two native features for testing async code.

First one is called 'polling conditions' and it evaluates assertions regularly until they become `true` or timeout is reached.
Assertion is considered as failed if it does not become `true` within specified time limit:

**Testing async code using polling conditions**
```groovy
class N36S_PollingConditions extends Specification {

    def conditions = new PollingConditions(timeout: 30)

    def 'find next prime after 1728 eventually'() {
        setup: 'holder for answer'
        Integer actual = null

        when: 'async start calculating next prime after 1728'
        asyncNextPrime( 1728, { answer -> actual = answer } )

        then: 'eventually answer will be found'
        conditions.eventually {
            assert actual == 1733
        }
    }

}
```

Second feature is called 'async conditions' and it is used to pass assertion expressions as callback for async code.
Assertion will be evaluated ones as usual when async call finishes or it will be considered as failed if it will be not reached within time limit:

**Testing async code using async conditions**
```groovy
class N37S_AsyncCondition extends Specification {

    def conditions = new AsyncConditions()

    def 'find next prime after 2817 within 3 seconds'() {
        when: 'async start calculating next prime after 1728'
        asyncNextPrime( 1728, { answer ->
            conditions.evaluate { assert answer == 1733 }
        } )

        then: 'within 3 seconds answer will be found'
        conditions.await(3)
    }

}
```

## Test execution control

![](/blog/spock-talk/spock-a8dfe.png)

### Disabling tests

The most simple test execution control feature is possibility to disable some of test cases.
It's implemented pretty similar in our traditional test frameworks:

**Disabling tests via JUnit**
```java
    @Ignore("will fix it before commit")
    @Test
    public void alwaysIgnored() {
        // TODO FIXME test is failing
        assertThat(2+2, is(5));
    }
```

**Disabling tests via TestNG**
```java
    @Test(enabled = false)
    public void alwaysIgnored() {
        // TODO FIXME test is failing
        assertEquals(2+2, 5);
    }
```

**Disabling tests via JUnit 5**
```java
    @Disabled("will fix it before commit")
    @Test
    public void alwaysIgnored() {
        // TODO FIXME test is failing
        assertEquals(5, 2+2);
    }
```

There is no surprise that Spock can do the same:

**Disabling tests via Spock**
```groovy
    @Ignore('will fix it before commit')
    def 'this test is always ignored'() {
        // TODO FIXME test is failing
        expect: 'that 2+2=5'
        2 + 2 == 5
    }
```

What is more interesting is conditional disabling.
In JUnit it is implemented with Assumptions API.
Assumptions are very similar to assertions, but when they fail, it causes test to be skipped, not failed:

**Conditional disabling tests via JUnit**
```java
    @Test
    public void ignoredOnWindows() {
        assumeThat(System.getProperty("os.name").toLowerCase(), is(not(containsString("windows"))));
```

In Spock, the same feature is implemented as part of Ignore API.
Moreover, it has more various features like disabling and enabling conditions and predefined conditions (environment operating system, installed java version, system properties and environment variables):

**Conditional disabling tests via Spock**
```groovy
    @IgnoreIf({ os.windows || sys['pretend.os'] == 'windows' })
    def 'this test is ignored on Windows'() {
        expect: 'that we are not on Windows'
        !System.properties['os.name'].toString().toLowerCase().contains('windows')
    }

    @Requires({ jvm.java8 && env['JAVA_HOME'] != null })
    def 'this test requires JAVA_HOME set and Java 8 installed'() {
        expect: 'that we are on Java 8'
        'java -version'.execute().errorStream.text.contains('java version "1.8.0_101"')
    }

    @IgnoreIf({ new Random().nextBoolean() })
    def 'this test is SOMETIMES ignored'() {
        when: 'i hate my job'
        Integer.metaClass.plus = { Integer other ->
            return 5
        }

        then: 'i can make them pay'
        2 + 2 == 5
    }

    @Requires({ N40S_ConditionalRuns_Part2.isGoogleSearchAvaiable() })
    def 'this test runs only if Google Search is avaiable'() {
        setup: 'http connection service'
        def http = new HTTPBuilder('https://google.com')

        when: 'we search for the best java unit testing framework'
        def response = http.get(path : '/search', query : [q:'best java unit testing framework'])

        then: 'answer mentions spock'
        response.toString().toLowerCase().contains 'spock'
    }

    static boolean isGoogleSearchAvaiable() {
        try {
            new HTTPBuilder('http://www.google.com').get([:])
            return true
        } catch (e) {
            return false
        }
    }
```

Besides that, Spock has one more small and very useful feature, especially for functional testing.
If you need to re-run just one single test from the full suite, you no longer need to mark all the rest with `@Ignore`.
Please welcome self-describing `@IgnoreRest` annotation:

**Disabling tests via Spock**
```groovy
    @IgnoreRest
    def 'this test makes all other test ignored'() {
        expect: 'a miracle'
        2 + 2 == 5
    }
```

Moreover, Spock 1.1 introduces one more interesting way to disable test case called Pending Feature.
If you mark test case with a `@PendingFeature` annotation, it will have following behavior:
if it fails, it will be reported as skipped (ignored) test case, as test case for unimplemented feature is not important for overall test result;
if it passed, it will be reported as failed (sic!) test case, as it's strange that test case for unimplemented features succeeded, so it should be explicitly reported:

**Pending Feature in Spock**
```groovy
    @PendingFeature
    def 'this test is passing'() {
        expect: 'that 2*2=4'
        2 * 2 == 4
    }

    @PendingFeature
    def 'this test is failing'() {
        expect: 'that 2*2=5'
        2 * 2 == 5
    }
```

### Test suites

Following usual pattern for this article let's look how we can organize test suites in traditional test frameworks:

**Test suites via JUnit**
```java
    @Category(Fast.class) // <1>
    @Test
    public void passedFast() {
        assertThat(2+2, is(4));
    }

    @Category(Slow.class) // <1>
    @Test
    public void failingIn20Seconds() throws InterruptedException {
        Thread.sleep(TimeUnit.SECONDS.toMillis(20));
        assertThat(2+2, is(4));
    }

@RunWith(Categories.class)
@Categories.IncludeCategory(Fast.class) // <2>
@Suite.SuiteClasses(N45J_TestSuites_1.class)
public class N45J_TestSuites_2 {}
```

1. Suites tagging
2. Suites selection

**Test suites via TestNG**
```java
    @Test(groups = "fast") // <1>
    public void passedFast() {
        assertEquals(2+2, 4);
    }

    @Test(groups = "slow") // <1>
    public void failingIn20Seconds() throws InterruptedException {
        Thread.sleep(TimeUnit.SECONDS.toMillis(20));
        assertEquals(2+2, 5);
    }
```

1. Suites tagging

**src/test/resources/testng.xml**
```xml
<!DOCTYPE suite SYSTEM "http://testng.org/testng-1.0.dtd" >
<suite name="Suites">
    <test name="TestSuites">
        <groups>
            <run>
                <include name="fast"/> // <1>
                <exclude name="slow"/> // <1>
            </run>
        </groups>
        <classes>
            <class name="N46T_TestSuites"/>
        </classes>
    </test>
</suite>
```

1. Suites selection

**Test suites via JUnit 5**
```java
    @Tag("fast") // <1>
    @Test
    public void passedFast() {
        assertEquals(4, 2+2);
    }

    @Tag("slow") // <1>
    @Test
    public void failingIn20Seconds() throws InterruptedException {
        Thread.sleep(TimeUnit.SECONDS.toMillis(20));
        assertEquals(5, 2+2);
    }
```

1. Suites tagging

Spock (no surprises) does the same, but again and again preferring code over strings or XMLs:

**Test suites via Spock**
```groovy
    @Fast // <1>
    def passedFast() {
        expect: 'that everything is ok'
        2 + 2 == 4
    }

    @Slow // <1>
    def failingIn20Seconds() {
        setup: 'some resource'
        Thread.sleep(TimeUnit.SECONDS.toMillis(20))

        expect: 'that everything is not ok'
        2 + 2 == 5
    }
```

1. Suites tagging

**src/test/resources/SpockConfig.groovy**
```groovy
runner {
    include Fast // <1>
    exclude Slow // <1>

    optimizeRunOrder true // <2>
}
```

1. Suites selection
2. And one more! This key reorders tests to run all failed first, starting from the most fast ones to the most slow.

## Miscellanea

![](/blog/spock-talk/spock-52d3a.png)

There are a number of Spock feature worth mentioning as well.

Being a good topic for separate article, there is a very simple and convenient mechanism of creating Spock extensions.
Just as quick example, to print test inner structure to console all you need is:

**Spock extensions example**
```groovy
import org.spockframework.runtime.AbstractRunListener
import org.spockframework.runtime.extension.AbstractAnnotationDrivenExtension
import org.spockframework.runtime.model.FeatureInfo
import org.spockframework.runtime.model.SpecInfo

class ReportExtension extends AbstractAnnotationDrivenExtension<Report> { // <1>

    @Override
    void visitSpecAnnotation(Report annotation, SpecInfo spec) {
        spec.addListener(new AbstractRunListener() { // <2>

            @Override
            void afterFeature(FeatureInfo feature) {
                for (block in feature.blocks) { // <3>
                    for (text in block.texts) { // <4>
                        println "${block.kind.name().toLowerCase()} $text" // <5>
                    }
                }
            }
        })
    }
}
```

1. Extensions is enabled by `@Report` annotation
2. Attaching listener to Spock specification processor
3. For each test block
4. For each text string describing test block
5. Print it to console

If you need your test to change system properties there is always a challenge to restore them back after test execution.
Spock introduces annotation `@RestoreSystemProperties`, which does exactly the thing.
For the sake of example, another Spock annotation is used: `@Stepwise`, which makes Spock to execute tests in the order they are specified in the code.
Being damned in the unit testing worlds, it is more than useful for integration and functional tests:

**`@RestoreSystemProperties` and `@Stepwise` example**
```groovy
@Stepwise
class N48S_SystemProperties extends Specification {

    @RestoreSystemProperties
    def 'set spock version'() {
        expect: 'that spock.version is not set'
        System.getProperty('spock.version') == null

        when: 'spock version is set'
        System.setProperty('spock.version', '1.1')

        then: 'we can retrieve its value back'
        System.getProperty('spock.version') == '1.1'
    }

    def 'check spock version is not set'() {
        expect: 'that spock.version is not set'
        System.getProperty('spock.version') == null
    }
}
```

Sometimes, when a complex object needs to be checked, it can be useful to group all assertions within `with` group as follows:

**`with` example**
```groovy
        then: 'list is not empty, is of size 4, and contains all added values'
        with(list) {
            empty == false
            size() == 4
            get(0) == 'we'
            get(1) == 'will'
            get(2) == 'love'
            get(3) == 'spock'
        }
```

Moreover, complex assertions can be grouped inside `verifyAll` block.
It will assert multiple expressions without short-circuiting those after a failure, so all failures will be reported:

**`verifyAll` example**
```groovy
        then: 'list is not empty, is of size 3, and contains all added values'
        verifyAll {
            list.empty == false
            list.size() == 3
            list.get(0) == 'we'
            list.get(1) == 'love'
            list.get(2) == 'spock'
        }
```

As a rule, Spock does not ignore previously implemented traditional features.
This is great, as JUnit Rules still work with Spock:

**JUnit Rules example**
```groovy
class N51S_JUnitRules extends Specification {

    @org.junit.Rule OutputCapture capture = new OutputCapture()

    def "capture output print method"() {
        when: 'text is printed to console'
        print "2 + 2 = ${2+2}"

        then: 'it is printed as expected'
        capture.toString() == '2 + 2 = 4'
    }
}
```

Spock does not forget Groovy-specific features.
For example, it supports metaprogramming testing.
`@ConfineMetaClassChanges` confine all metaprogramming tricks within test where they are declared:

**Metaprogramming testing example**
```groovy
    @ConfineMetaClassChanges([Integer])
    def 'sometimes 2 + 2 = 5'() {
        setup: 'very special Integer + Integer operation'
        Integer.metaClass.plus = { Integer other ->
            return 5
        }

        expect: '2 + 2 == 5'
        2 + 2 == 5
    }

    def 'usually 2 + 2 == 4'() {
        expect: '2 + 2 == 4'
        2 + 2 == 4
    }
```

Also, Spock has plenty of integrations, among which Spring and Grails are the most important:

**Spock-Spring integration example**
```groovy
@ContextConfiguration(classes = Config)
class N22S_Stubs extends Specification {

    @Autowired
    PasswordGenerator passwordGenerator
```

## Geb

And the last thing, that worth special mention is [Geb](http://www.gebish.org/).
Geb is a browser automation solution, developed by one of Spock main contributor Luke Daley.
It brings together the power of WebDriver, the elegance of jQuery content selection, the robustness of Page Object modelling and the expressiveness of the Groovy language.
It can be used for scripting, scraping and general automation — or equally as a functional/web/acceptance testing solution.
And preferable Geb testing approach is greatly inspired by Spock framework.
Just look at simple example:

**Geb example**
```groovy
import geb.spock.GebSpec
import spock.lang.Title

@Title('Geb example')
class N49S_Geb extends GebSpec {

    static {
        System.setProperty('webdriver.gecko.driver', 'D:\\Tools\\Selenium\\geckodriver.exe')
    }

    def 'search for wikipedia in google'() {
        when: 'go to google.com'
        go 'http://www.google.com'

        then: 'page title is Google'
        title == 'Google'

        when: 'enter wikipedia and click on search'
        $('input', name: 'q').value('wikipedia')
        $('input', name: 'btnG').click()

        then: 'title is wikipedia'
        waitFor { title.startsWith 'wikipedia - ' }

        expect: 'that search result contains link to ru.wikipedia.org'
        $('*', 0).text().contains('ru.wikipedia.org')
    }
}
```

Even if you like JUnit or TestNG so much that you don't want to migrate them, you can introduce Spock into your project via Geb.
Geb is obviously the best in his role and if you need web functionally testing it is more than worth trying.

## Why Use Spock?

- *Concise syntax*
If you are tired with verbosity and ceremonies of Java, which are multiplied several times for test code, Spock is a great choice.
It uses Groovy magic and own features to make your test code short but still understandable.

- *Language for testing instead of testing struggling language*
Naturally, you use language features to express your intent in test (and not only test) code.
If you use language designed specially for testing, you will obviously always can find constructions that were designed specially for your case.
And when you use general-purpose language like Java for testing you just try to make it fit your needs, which is not working well in all cases.

- *Clear test structure*
Spock enforce inner test structure.
Being a generally good practice to do it via comments or method separation in traditional test frameworks, Spock makes it true in 100% test cases.

- *Code and reports readable for everyone*
While Spock code is by design and by Spock philosophy can be read even by non-development folks like QA engineers or managers, it's also possible to immediately share Spock reports with anyone interested without any additional post-processing.

- *Powerful built-in features*
Spock has plenty of small and huge built-in features ready to cover any of your need immediately.
Even for your 1% chance test requirement there probably is a Spock feature that makes it easier and more pleasant to develop.

- *Extensions*
Even if Spock does not have a good feature for your case, it has simple and powerful extension mechanism which you can use to make it better fit your needs.

- *Integrations*
Spock seamlessly integrates with Spring, Grails, Guice, Tapestry, Unitils; JUnit, Mockito, Hamcrest, AssertJ, Google Truth and others.

- *One framework for any testing approach*
Spock philosophy states that you should be able to use single Spock library for any possible testing approach.
So, Spock is useful for unit, integration and functional testing.
Spock has powerful native support of assertions and mocking.
Spock is good for TDD, BDD and chaotic testing.
And anyway, Spock can be greatly integrated with helper testing libraries like Hamcrest, Mockito or others, if you want to.

- *Behaves as one more JUnit runner*
Inside, besides tons of pure magic, Spock is just one more JUnit runner.
It means that is integrates easily with build tools, CI/CD tools, reporting libraries and actually everything that accepts JUnit.

- *Works for both Groovy and Java*
Being great part of Groovy world, just like many other Groovy projects, there is no great need to dig into Groovy to understand Spock.
After getting its main concepts, you can test both Groovy and Java code, using either Groovy or pure Java expressions inside test blocks.

## Why Do Not Use Spock?

The first thing you should keep in mind about Spock, is that usually you can find corresponding features in JUnit or TestNG.
If no, Hamcrest/AssertJ/Mockito/someone can probably help you.
If still no, you can try to imitate some of Spock features even within JUnit/TestNG limitations.
Being not so beautiful, it will work in 90% of the cases, while Spock is just a fresh look on the traditional approaches or even when it introduces new features that can be reproduced.

Another thing is that Spock is now in the process of finding new development model.
Luke Daley has left the project long time ago.
Peter Niederwleser has stopped Spock contribution more than a year ago after joining Apple.
Now Spock is public [Github project](https://github.com/spockframework/spock), and after some standstill after 1.0 release seems that now it is on the way to stable wide community development model, as 1.1 release is almost ready for GA.

![](/blog/spock-talk/article-27c07.png)

## When Use Spock?

The main precondition before start using Spock, is your team being ready to accept it.
There is no other limitation or significant expected problems for it.
Spock integrates well with all your other solutions, can be easily migrated from existing JUnit/TestNG code, does not require great additional  knowledge or efforts to maintain.

Obviously, the simplest case is when you are about to start new project: just use Spock from the very beginning and enjoy it, nothing more.
If you have legacy code without unit testing coverage, the case is pretty similar: it's not a problem to start using Spock for it immediately.

If you already have JUnit tests in your code, the good strategy for Spock migration is start developing new test cases via Spock.
As Spock is in some way just a JUnit runner both test suites are integrated into one view without any efforts.
During the further process, you can start continuous migration from JUnit to Spock one test class by one, which is very easy as renaming files and changing five lines of code for each test case.
For the TestNG, things are little bit harder, so good strategy will be keeping two separate test suites and quick migration from TestNG to Spock.

And the last great entrance point for Spock into your project is Geb.
If you are about to introduce functional testing into your web project, Geb will be the best choise, that besides all other benefits, will introduce Spock to your team.

## Looking Further

Thanks for your attention!
If you do like or don't like this article, please share your opinion.
I will appreciate your feedback (including surely negative one) in any form available for my attention (like social media, direct e-mail, or etc.).

If you are interested in this topic I can recommend you following resources:

To read:

- link:http://spockframework.github.io/spock/docs/1.0/index.html[Spock documentation, window="_blank"]
- link:http://mrhaki.blogspot.com/search/label/Spock[mrhaki block filtered on Spock, window="_blank"]
- link:http://codepipes.com/presentations/spock-vs-junit.pdf[Spock vs JUnit by Kostis Kapelonis, window="_blank"]
- link:https://speakerdeck.com/szpak/smarter-testing-java-code-with-spock-framework[Smarter testing Java code with Spock Framework by Marcin Zajączkowski, window="_blank"]
- link:https://www.manning.com/books/java-testing-with-spock[Java Testing with Spock by Konstantinos Kapelonis, window="_blank"]
- link:http://www.gebish.org/manual/current/[Geb documentation, window="_blank"]
- link:http://www.slideshare.net/JacobAaeMikkelsen/geb-for-browser-automation[Geb for browser automation by Jacob Aae Mikkelsen, window="_blank"]

To examine:

- link:https://github.com/spockframework[Spock Github organization, window="_blank"]
- link:https://github.com/spockframework/spock[Spock sources, window="_blank"]
- link:https://github.com/spockframework/spock-example[Spock examples, window="_blank"]
- link:https://github.com/spockframework/spock/tree/master/spock-specs/src/test/groovy/org/spockframework/smoke[Spock self smoke tests, window="_blank"]
- link:https://github.com/renatoathaydes/spock-reports[Spock reports project, window="_blank"]

To try:

- link:http://meetspock.appspot.com/[Spock web console, window="_blank"]

To watch:

- link:https://www.youtube.com/watch?v=RuTupC0I59M[Idiomatic Spock by Rob Fletcher, window="_blank"]
- link:https://www.youtube.com/watch?v=i28F13zZwlg[Spock: A Logical Framework for Enterprise Testing by Ken Kousen, window="_blank"]
