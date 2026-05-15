---
id: how-to-learn-more/blogs
type: chapter
part_id: how-to-learn-more
part_label: "XIII"
part_title: "How to Learn More"
title: "Blogs"
synopsis: "Cloudflare, Meta Engineering, APNIC Labs, ipSpace.net."
podcast_target_minutes: 12
position_in_book: chapter 83 of 75
listening_order:
  prev: how-to-learn-more/courses
  next: how-to-learn-more/tools
related_protocols: [quic, bgp, http3]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A reading-list collage: eight browser tabs side by side, each showing a different blog's logo — Cloudflare, Meta Engineering, APNIC Labs, ipSpace, daniel.haxx.se, wizardzines, Hacker News, IETF Datatracker."
  - "A diagram of the global Cloudflare anycast network: one IP address, dots in 300+ cities, arrows from a user to the nearest dot."
  - "A 'where the field talks to itself' map: blog posts on the left, working-group mailing list threads in the middle, RFC drafts on the right, arrows showing ideas flowing from operators to standards."
---

# Part XIII, Chapter — Blogs

## The hook
Standards documents tell you what a protocol is supposed to do. Blogs tell you what actually happens when you turn it on at scale. This chapter is the short list of places where the people who run the internet write down what they learned that week — Cloudflare, Meta, APNIC, ipSpace, the curl maintainer, Julia Evans, Hacker News, and the IETF mailing lists themselves. If you read one networking blog, the chapter says, read Cloudflare's.

## The story

### Where the Field Talks to Itself

Networking is one of those fields where the best writing isn't in textbooks. It's in post-mortems, deployment notes, measurement reports, and mailing-list threads. The book's recommendation is short and opinionated. Eight sources. Each picked for a specific reason.

Start with the **Cloudflare blog**, at blog.cloudflare.com. The chapter calls it the most consistently good source of operationally-grounded networking content on the internet. Cloudflare runs a global anycast network — one IP address, many physical locations, the network routes each request to the nearest one. They see real production traffic at the scale where the interesting bugs live, and they write up both the engineering and the security incidents in detail. If you only read one networking blog, the chapter says, read this one.

Next, the **Meta Engineering blog**, at engineering.fb.com. Periodic deep-dives on the protocols and infrastructure powering Facebook, Instagram, and WhatsApp. Strong on QUIC deployment — the mechanism story for QUIC is the QUIC episode, but Meta's posts tell you what it looked like to migrate billions of users onto it. Strong on BGP operations too. The mechanism for BGP — sessions, OPEN messages, UPDATE messages, AS_PATH — is covered in the BGP episode. Meta's blog is where you read about running BGP across one of the largest private backbones in the world, and what it costs when it goes wrong.

Then, **APNIC Labs**, at blog.apnic.net. The chapter singles out Geoff Huston's writing as the best long-form analysis of internet measurement and policy out there. Long, dense, worth the time. APNIC is one of the regional internet registries, the body that hands out IP addresses in the Asia-Pacific region, so the lab sits on top of an enormous amount of measurement data. Huston's posts are the closest thing the internet has to a working historian.

Then, **ipSpace.net**. Ivan Pepelnjak's blog on enterprise networking, software-defined networking, and the practical realities of operating real networks. Pragmatic and opinionated — the chapter's words. If Cloudflare is hyperscale and APNIC is policy, ipSpace is the world of campus and enterprise routers, where most of the actual gear lives.

Then, **Daniel Stenberg's blog**, at daniel.haxx.se. Stenberg maintains curl. The chapter's pitch: if you want to understand HTTP at the level where bugs actually live, read his QUIC and HTTP/3 deployment posts. The HTTP/3 mechanism — same methods and headers as HTTP/1, but riding on QUIC instead of TCP — is the HTTP/3 episode. Stenberg's blog is where you read about the dozens of edge cases that made it into production.

Then, **Julia Evans' zines**, at wizardzines.com. Short, illustrated explainers on networking primitives, debugging tools, kernel concepts. The chapter calls them the ideal reference for "I need to learn what tcpdump options I'm using." Different in tone from everything else on the list. A good antidote when the rest of your reading gets too dense.

Then, the **Hacker News networking tag**, for breaking news. The chapter's advice: set up a saved search. The discussions, it adds, are usually more useful than the articles themselves. That's a half-joke, half-true.

And finally, **the IETF mailing lists themselves**, at datatracker.ietf.org. The IETF is the open, volunteer-run standards body that has shepherded internet protocols since 1986. Their motto: rough consensus and running code. No membership fees. No votes. Anyone with technical merit and patience can drive a spec to publication. If you want to see protocols being designed in real time — arguments, drafts, working-group decisions — subscribe to a working group whose work interests you. The chapter's warning: be ready for high traffic.

That's the list. Eight sources. The pattern is consistent: writing by people who operate the thing, not people who only theorize about it.

## Where to go deeper

- The QUIC episode picks up the mechanism — UDP-based transport with TLS 1.3 baked in, 1-RTT handshake, 0-RTT on resumption, independent streams that fix head-of-line blocking. The Meta and Stenberg blogs are where you watch that mechanism meet production.
- The BGP episode covers the path-vector protocol that holds the internet together — eBGP between autonomous systems, iBGP inside one, sessions over TCP port 179, and what happens when a misconfiguration takes Facebook offline for six hours, as it did in October 2021.
- The HTTP/3 episode covers the swap of TCP for QUIC under HTTP — same API, faster connections, no head-of-line blocking, and the path that took it to roughly 35% of web traffic by 2025.

## Listening order

- **Before this chapter:** "Courses" — the structured way in. Blogs are the unstructured continuation, where the field's current work lives.
- **After this chapter:** "Tools" — once you've read about how the network behaves, the next chapter is the kit you use to look at it yourself.

## Visual cues for image generation

- A reading-list collage: eight browser tabs side by side, each showing a different blog — Cloudflare, Meta Engineering, APNIC Labs, ipSpace, daniel.haxx.se, wizardzines, Hacker News, IETF Datatracker.
- An anycast map of the world: one IP address, hundreds of city dots, a single user with arrows fanning out to the nearest dot.
- A "where the field talks to itself" diagram: blog posts on the left, working-group mailing-list threads in the middle, RFC drafts on the right, arrows showing ideas flowing from operators into standards.
- A two-column comparison: "what RFCs tell you" vs "what blogs tell you" — protocol on one side, deployment story on the other.
- A small portrait grid of the named voices behind the blogs: Geoff Huston at APNIC, Ivan Pepelnjak at ipSpace, Daniel Stenberg with curl, Julia Evans with a zine.
