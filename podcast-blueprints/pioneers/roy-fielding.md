---
id: roy-fielding
type: pioneer
name: Roy Fielding
years: "1965–"
title: Architect of HTTP/1.1 and REST
org: UC Irvine, Apache Software Foundation
podcast_target_minutes: 6
protocols: [http1, rest]
categories: []
related_book_chapters:
  - web-api/rest-and-graphql
awards: []
image:
  src: null
  alt: Portrait of Roy Fielding
  credit: null
visual_cues:
  - "Portrait composition: a doctoral student at a UC Irvine desk in 2000, dissertation cover 'Architectural Styles and the Design of Network-Based Software Architectures' visible beside a CRT terminal"
  - "A whiteboard with six labelled boxes — client-server, stateless, cacheable, layered, uniform interface, code-on-demand — connected to the word REST in the centre"
  - "An RFC cover sheet stamped 'RFC 2616 — HTTP/1.1, June 1999' overlaid on a screenshot of an early Apache httpd configuration file"
  - "Split frame: a feather logo of the Apache HTTP Server on the left, a sprawling map of public REST API endpoints on the right, captioned 'most of these are not RESTful'"
---

# Roy Fielding

## In one sentence
Roy Fielding is the engineer who co-wrote the HTTP/1.1 specification that ran the web for two decades, and then in his 2000 doctoral dissertation named and defined REST — the architectural style that almost every public API on the internet now claims to follow.

## The hook (cold-open)
In June 1999 the IETF published RFC 2616. It was the second edition of HTTP/1.1, and it was the protocol the web ran on for the next twenty years. One of the names on it was a graduate student at UC Irvine called Roy Fielding. A year later, in his doctoral dissertation, the same engineer gave a name to the architectural style he had been designing the protocol around. He called it Representational State Transfer — REST. A quarter of a century on, almost every public API on the internet calls itself a REST API. Fielding has spent most of those years pointing out that almost none of them actually are.

## The work

### HTTP/1.1 — RFC 2068 and RFC 2616
Fielding was a co-author of the HTTP/1.1 specification across both of its IETF editions: RFC 2068 in January 1997 and the revised RFC 2616 in June 1999. HTTP/1.1 was the version of the protocol that carried the web through the dot-com years and the rise of mobile, and it stayed the dominant version on the wire until HTTP/2 shipped in 2015. The wire-format details — persistent connections, chunked transfer encoding, the Host header, conditional requests — belong in the HTTP/1.1 episode. The biographical fact for this episode is that the protocol that defined a generation of the web has Fielding's name on the cover.

### REST — the 2000 dissertation
In 2000 Fielding submitted his doctoral dissertation at UC Irvine, *Architectural Styles and the Design of Network-Based Software Architectures*. Chapter 5 named and defined REST — Representational State Transfer — as a set of six constraints: client-server, stateless, cacheable, layered system, uniform interface, and an optional code-on-demand. The dissertation framed HTTP as a worked example of those constraints, not the other way around. Within a few years REST had become the default vocabulary for designing web APIs, displacing SOAP and XML-RPC for most new public services. The architectural detail — what the six constraints actually mean, and how they map onto verbs and resources and media types — is the subject of the REST and GraphQL chapter episode.

### The Apache HTTP Server and the Apache Software Foundation
Alongside the standards work, Fielding co-founded the Apache HTTP Server Project — the open-source web server that, through the late 1990s and 2000s, served the majority of websites on the internet. He went on to chair the Apache Software Foundation, the umbrella organisation that grew out of the project and now stewards hundreds of open-source projects beyond the original web server.

### The long argument about HATEOAS
The vast majority of services that call themselves REST APIs do not satisfy Fielding's strict definition. The constraint they almost always fail is the one usually shortened to HATEOAS — hypermedia as the engine of application state — which requires that a client navigate the API by following links the server returns, rather than by hard-coding URL templates. Fielding has spent twenty-five years, in essays and conference talks and mailing-list replies, pointing out that an HTTP-and-JSON API with hard-coded endpoints is not what he meant by REST. The terminology has won; the strict definition has not.

## Where they appear in the book
- Part Web / API, chapter "REST and GraphQL" — Fielding's six constraints are the frame the chapter uses to compare REST against GraphQL, and the HATEOAS argument is the through-line.

## See also (other pioneer episodes)
The protocols Fielding shaped have their own episodes — the HTTP/1.1 episode walks through the wire format he co-specified, and the REST episode is the architectural deep-dive on the style he named.

For the wider context of the web platform Fielding was building HTTP/1.1 on top of, the Tim Berners-Lee episode covers the original HTTP, HTML and URL design from CERN — HTTP/1.1 is the version of the protocol that took Berners-Lee's sketch and hardened it into the standard the commercial web ran on.

## Sources

**Wikipedia**
- [Roy Fielding — Wikipedia](https://en.wikipedia.org/wiki/Roy_Fielding)

**Homepage**
- [roy.gbiv.com](https://roy.gbiv.com/)
