---
id: paul-mockapetris
type: pioneer
name: Paul Mockapetris
years: "1948–"
title: Inventor of DNS
org: USC Information Sciences Institute, ThreatSTOP
podcast_target_minutes: 6
protocols: [dns]
categories: []
related_book_chapters:
  - utilities-security/dns
awards:
  - { name: "Internet Hall of Fame", year: 2012, url: null }
  - { name: "IEEE Internet Award", year: 2003, url: null }
  - { name: "ACM SIGCOMM Award", year: 2005, url: null }
image:
  src: null
  alt: Portrait of Paul Mockapetris
  credit: null
visual_cues:
  - "Portrait composition: Mockapetris at USC's Information Sciences Institute in Marina del Rey in the early 1980s, terminal on the desk, a printed copy of HOSTS.TXT beside it"
  - "Cover sheets of RFC 882 and RFC 883, dated November 1983, lying next to RFC 1034 and RFC 1035, dated November 1987 — the four documents that defined DNS"
  - "A diagram of a single flat HOSTS.TXT file on the left, a hierarchical tree of zones — root, com, org, edu — fanning out on the right, with an arrow labelled '1983' between them"
  - "An ARPANET-era teletype printing a name lookup against a single text file, captioned 'a few hundred hosts,' next to a modern resolver query, captioned 'billions'"
---

# Paul Mockapetris

## In one sentence
Paul Mockapetris is the engineer who, in 1983, replaced the single text file the entire internet used to look up names with a hierarchical, distributed, cacheable system that has scaled from a few hundred hosts to billions.

## The hook (cold-open)
Until 1983, the internet had a phone book. It was one file. It was called HOSTS.TXT. Every machine on the ARPANET kept a copy, and every time a new host came online, somebody at SRI updated the master and everyone else pulled it down. That did not scale. In November 1983, Paul Mockapetris, working at USC's Information Sciences Institute in Marina del Rey, published two RFCs — 882 and 883 — that proposed a different idea: a tree of names, split across many servers, with answers cached close to the asker. Four years later he revised them into RFCs 1034 and 1035. Those four documents are the Domain Name System. They are still in force.

## The work

### Replacing HOSTS.TXT
The story to hold onto is the one the dump tells: in the ARPANET era, name-to-address lookup was a single text file that someone updated by hand. As the network grew, that file grew, and the cost of distributing it grew with it. Mockapetris's design in 1983 split the namespace into a hierarchy of zones, delegated authority for each zone to its operator, and let resolvers cache answers so the root never had to be hit for a popular name. The DNS episode walks through the mechanism — zones, records, recursion, caching — in detail; the biographical fact is that one designer, at one institute, made the architectural call that is still how the internet finds anything.

### RFC 882, 883, 1034, 1035
The first two RFCs landed in November 1983. The revisions, RFC 1034 and RFC 1035, landed in November 1987 and are the documents implementations cite to this day. The DNS episode is the place to unpack what is in them. The point here is the longevity: the spec written in the late 1980s is the spec the modern internet still runs.

### The second act — anti-abuse and DNS security
Mockapetris did not stop with the original design. He has continued to work on naming, on DNS-based anti-abuse, and on DNS security through ThreatSTOP and through the IETF, the standards body that governs the protocol's evolution. The original DNS had no notion of authentication; the work that came after — DNSSEC, response policy zones, threat intelligence delivered over the DNS itself — is the field he helped open and is still active in.

## Awards and recognition
Mockapetris received the IEEE Internet Award in 2003 and the ACM SIGCOMM Award in 2005. He was inducted into the Internet Hall of Fame in 2012, in its inaugural class.

## Where they appear in the book
- Part "Utilities & Security," chapter "DNS" — Mockapetris's 1983 design and its 1987 revision are the chapter's primary text; the four RFCs are the source documents the chapter is built on.

## See also (other pioneer episodes)
Jon Postel ran the RFC Editor and the numbers registry at the same institute, ISI, in the same years Mockapetris was designing DNS — the Postel episode is the closest companion piece on what ISI shipped, and the registry regime DNS plugged into was Postel's.

Vint Cerf and Bob Kahn designed the protocol layer that DNS rides on top of — the Cerf and Kahn episodes give the founding context for the network whose naming problem Mockapetris solved.

## Sources

**Wikipedia**
- [Paul Mockapetris — Wikipedia](https://en.wikipedia.org/wiki/Paul_Mockapetris)
