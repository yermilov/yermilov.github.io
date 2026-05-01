---
title: "Tiebreaker Regarding Java HashMap, TreeNode and TieBreakOrder"
canonicalSlug: "tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder"
language: "en"
publishedAt: 2017-02-24
summary: "On the latest JUGUA meeting Igor Dmitriev has delivered a talk about minor, behind the scenes changes in JDK."
tags: []
translations:
  en: "tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder"
coverImage: "/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/01.png"
---
On the latest [JUGUA meeting](http://jug.ua/2017/02/clean-tests-jdk-changes/) Igor Dmitriev has delivered a talk about minor, behind the scenes changes in JDK. On of them, seems to be widely-known, was HashMap being intelligent enough to turn buckets which are actually long linked lists (because of pure hashCode implementation) into search-trees. Anyway, Igor greatly explained it in a very detailed manner. One thing that was unclear for me, and Igor was not able to explain it as well, is why search tree is constructed for keys which do not have ordering? After some time investigating this question at home, seems like I have the answer.

## Preface

First, the puzzler with a well-known solution. What’s wrong with this code?

```groovy
class TiebreakerKey28 {
    int value

    int hashCode() {
        28
    }

    boolean equals(o) {
        if (this.is(o)) return true
        if (getClass() != o.class) return false

        TiebreakerKey28 key = (TiebreakerKey28) o

        if (value != key.value) return false

        return true
    }
}

HashMap<TiebreakerKey28, String> hashMap = new HashMap<>()

10.times {
    hashMap.put(new TiebreakerKey28(value: it), "hello for the $it time")
}
```

Not a big secret, because of very bad hash code function, all entries will go the same bucket and form a linked list with poor performance.

![tiebreaker 4e86c 4e86c2bd6d8ad4629cd44accb889be91](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/01.png)

Good news is that Java is clever enough to transform this list into self-balancing binary search tree after the size of the problem (and map) is big enough.

```java
if (binCount >= TREEIFY_THRESHOLD - 1) // TREEIFY_THRESHOLD = 8
    treeifyBin(tab, hash);

...

final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY) // MIN_TREEIFY_CAPACITY = 64
        resize();
    else ... // actually treeify
```

Putting into simple words, for 10 elements with same hash code we will get a linked list:

![tiebreaker eee9f eee9f37c77d38e8cb0ceabdc3fc4f883](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/02.png)

For 11 elements, list will be treeified:

![tiebreaker 72e7c 72e7c6c141be981f3d2f56e8d342d929](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/03.png)

## Closer to the problem

The attentive reader will ask: if HashMap organizes self-balancing binary search tree, how does it determine an order of elements, which is the must for this data structure? Well, if you class luckily implements *Comparable* interface, it’s pretty easy job:

```groovy
class TiebreakerKey28 implements Comparable<TiebreakerKey28> {
    int value

    int hashCode() {
        28
    }

    boolean equals(o) {
        if (this.is(o)) return true
        if (getClass() != o.class) return false

        TiebreakerKey28 key = (TiebreakerKey28) o

        if (value != key.value) return false

        return true
    }

    @Override
    int compareTo(TiebreakerKey28 other) {
        this.value <=> other.value
    }
}

HashMap<TiebreakerKey28, String> hashMap = new HashMap<>()

11.times {
    hashMap.put(new TiebreakerKey28(value: it), "hello for the $it time")
}
```

![tiebreaker 512ed 512edac15bc15f2e881c438e0baeee4c](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/04.png)

But what if not? In this case as a [tiebreaker](https://en.wikipedia.org/wiki/Tiebreaker), HashMap uses [System.identityHashCode()](https://docs.oracle.com/javase/8/docs/api/java/lang/System.html#identityHashCode-java.lang.Object-). Or simpler, some value unique and constant for each instance.

![tiebreaker 93a1a 93a1af2efc58a8fe7c9ff1fdc4b030f6](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/05.png)

## So long! What’s the problem?

The problem is that HashMap does not use tiebreak order on get operation.

If key class implements *Comparable*, get operation uses search tree feature:

![tiebreaker d35a8 d35a8ac56ddde62abc2177ae5c297000](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/06.png)

If key class does not implement *Comparable*, it will traverse all the tree to find specified entry:

![tiebreaker f3142 f3142241619599dd171768d3c73f7604](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/07.png)

Given this, two questions occur one by one:

Q-1. Why is tiebreak order not used?

A-1. This one is easy:

```groovy
TiebreakerKey28 key1 = new TiebreakerKey28(value: 28)
TiebreakerKey28 key2 = new TiebreakerKey28(value: 28)

assert key1 == key2
assert System.identityHashCode(key1) == System.identityHashCode(key2)

// Assertion failed:
//
// assert System.identityHashCode(key1) == System.identityHashCode(key2)
//               |                |     |         |                |
//               1205406622       |     false     293907205        TiebreakerKey28(28)
//                                TiebreakerKey28(28)
```

By definition, two equal object instances will have different identity hash code, so we can’t use it as a comparator.

Q-2. ****If we need to traverse the full tree, why HashMap bothers itself with constructing a tree? No benefits, just wasted time on tree creation!****

## Answer

It’s so simple! HashMap can contain keys of different classes. And some of them may be *comparable* and some of them not.

```groovy
class TiebreakerKey28 {
    int value

    int hashCode() {
        28
    }

    boolean equals(o) {
        if (this.is(o)) return true
        if (getClass() != o.class) return false

        TiebreakerKey28 key = (TiebreakerKey28) o

        if (value != key.value) return false

        return true
    }
}

class TiebreakerComparableKey28 implements Comparable<TiebreakerComparableKey28> {
    int value

    int hashCode() {
        28
    }

    boolean equals(o) {
        if (this.is(o)) return true
        if (getClass() != o.class) return false

        TiebreakerComparableKey28 key = (TiebreakerComparableKey28) o

        if (value != key.value) return false

        return true
    }

    @Override
    int compareTo(TiebreakerComparableKey28 other) {
        this.value <=> other.value
    }
}

HashMap hashMap = new HashMap<>()

(1..6).each {
    hashMap.put(new TiebreakerKey28(value: it), "hello for the $it time")
}

(7..12).each {
    hashMap.put(new TiebreakerComparableKey28(value: it), "hello for the $it time")
}
```

What does this mix imply? If we compare two keys of different classes, result is based on class name:

![tiebreaker 755ed 755edcfa943292ad31cbfc42ed20da05](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/08.png)

This means that key mix is pretty straightforward: first, all keys from first class goes, and then all from the second.

If we compare two keys of the same class, original rules are used: *compareTo()* or *System.identityHashCode()* is invoked.

And now, the main conclusions:

****if we want to get incomparable key from the map, full traverse is used:****

![tiebreaker 3f4b5 3f4b5cb15b2af11910548adf33ecc857](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/09.png)

****if we want to get comparable key from the map, while it goes through comparable keys on its way through the tree, it may use search-tree feature for quick search:****

![tiebreaker fe010 fe0105e3b53429e27e0f6d21618d71d8](/blog/tiebreaker-regarding-java-hashmap-treenode-and-tiebreakorder/10.png)

## Conclusion

One of my most favorite feature of programming craft, is that there are so many *magic* things, which after several hours of investigation turns into *very rational* decisions.