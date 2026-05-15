---
id: how-to-learn-more/courses
type: chapter
part_id: how-to-learn-more
part_label: "XIII"
part_title: "How to Learn More"
title: "Courses"
synopsis: "Stanford CS144 (build a TCP stack), MIT 6.829, Berkeley CS168."
podcast_target_minutes: 12
position_in_book: "chapter 82 of book"
listening_order:
  prev: how-to-learn-more/books
  next: how-to-learn-more/blogs
related_protocols: [tcp, ip, bgp, dns]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A three-month learning roadmap as a horizontal timeline: month 1 reads RFC 1180 and starts CS144 labs; month 2 finishes the TCP stack; month 3 reads Stevens Vol 1 — milestones marked with the lab name"
  - "Side-by-side comparison cards for CS144, MIT 6.829, Berkeley CS168, Princeton COS 461, and the Coursera Google Cloud specialisation — each card lists the focus area, what you build, and the prerequisite level"
  - "A diagram of the CS144 lab stack growing layer by layer: raw IP datagrams at the bottom, then a sender, then a receiver, then full TCP with congestion control on top — arrows showing 'this lab adds this piece'"
---

# Part XIII, Chapter — Courses

## The hook
You can read about networking forever and still not feel it. The fastest way past that wall is to build a TCP stack with your own hands, watch it talk to a real server, and then go read what the canonical research papers actually said. This chapter is a short, opinionated list of the courses that get you there — including one where, by the end, your code is interoperating with the live internet.

## The story

### Where to Learn by Doing

The single most useful course on this topic is **Stanford CS144 — Introduction to Computer Networking**. The labs walk you through implementing a working TCP/IP stack from scratch. Your code starts by sending raw IP datagrams and ends as a full reliable transport with congestion control. The materials are public, the labs run on Linux, and the stack you produce interoperates with the real internet — meaning you can point it at a live server and it will hold a conversation. How that reliable transport actually works under the hood — sequence numbers, acknowledgments, slow start, retransmission timers — is the heart of the TCP episode, so we won't re-derive it here. The point of CS144 is that you build it.

Next on the list is **MIT 6.829 — Computer Networks**. This one is graduate-level, and its centre of gravity is the research-paper canon: Cerf and Kahn's 1974 paper that invented TCP/IP, Van Jacobson's 1988 paper that saved the internet from congestion collapse, and the Cardwell BBR paper from 2016 that re-thought congestion control as a model of bottleneck bandwidth and round-trip time. The course is strong on routing and on congestion control. Materials and lecture videos are public. The mechanism behind those algorithms is covered in the TCP episode — 6.829 is about the papers and the arguments around them.

Then there is **Berkeley CS168 — Introduction to the Internet**. This one is newer than CS144 and points at operational reality rather than at academic theory. It spends real time on BGP, on CDN architecture, on DNS, and on real-world security incidents. The projects are appropriately practical: you build a small BGP simulator and you build a CDN. How BGP actually exchanges routes between autonomous systems is the BGP episode; how DNS resolves a name through the root, TLD, and authoritative tiers is the DNS episode. CS168's job is to make those protocols feel like things that real operators run, not abstractions on a slide.

If you want production-grade datacenter and cloud networking content rather than the academic treatment, there's the **Coursera "Networking in Google Cloud" specialisation** from Stanford. It's practical, hands-on, and well-paced. This is the path for engineers who already have the basics and want the cloud-operator vocabulary.

Finally, **Princeton COS 461 — Computer Networks**, taught by Jennifer Rexford. It is particularly strong on software-defined networking, on BGP, and on inter-domain routing. Rexford is a major contributor to the research in those areas, so the course reflects what an actual leader in the field thinks is worth teaching.

### The self-paced path

If you're not going to enrol in any of these and you want a sequence you can do alone, the chapter offers one. Read **RFC 1180** first — it's twenty-eight pages, and it's the gentlest serious introduction to TCP/IP that exists. Then take **CS144**. Then read **Stevens, TCP/IP Illustrated, Volume 1**. Three months of evenings on that path will make you genuinely fluent in the field. That's the chapter's claim, and it's a load-bearing one — the courses above are excellent, but this is the minimum-viable route.

## Listening order

- **Before this chapter:** *"Books"* — the chapter just before this one names the texts worth owning, including Stevens Vol 1, which is the third leg of the self-paced path.
- **After this chapter:** *"Blogs"* — once you've built a stack and read the canon, the next chapter is where the field is having its current arguments in public.

## Where to go deeper

- The TCP episode picks up the mechanism story — slow start, AIMD, fast retransmit, CUBIC, BBR — that CS144 has you implement and that the Jacobson and Cardwell papers in MIT 6.829 are arguing about.
- The IP episode covers the addressing and routing layer that the CS144 labs sit on top of — how a packet gets from one network to another with nothing but a TTL and a destination address.
- The BGP episode is the natural follow-on to the BGP simulator project in CS168 and to Rexford's inter-domain routing material in COS 461 — how autonomous systems learn paths to each other, and what happens when the configuration is wrong.
- The DNS episode is the matching deep dive for the DNS material in CS168 — root servers, TLDs, recursive resolvers, caching, and the security extensions that try to keep all of it honest.

## Visual cues for image generation
- A three-month learning roadmap as a horizontal timeline: month 1 reads RFC 1180 and starts CS144 labs; month 2 finishes the TCP stack; month 3 reads Stevens Vol 1 — milestones marked with the lab name.
- Side-by-side comparison cards for CS144, MIT 6.829, Berkeley CS168, Princeton COS 461, and the Coursera Google Cloud specialisation — each card lists the focus area, what you build, and the prerequisite level.
- A diagram of the CS144 lab stack growing layer by layer: raw IP datagrams at the bottom, then a sender, then a receiver, then full TCP with congestion control on top — arrows showing "this lab adds this piece."
- A bookshelf-and-screen montage: RFC 1180 open on a desk, a terminal showing a CS144 lab passing its tests, and Stevens Vol 1 next to a coffee cup — captioned "three months of evenings."
- A simple Venn diagram showing what each course covers: CS144 in the "build it" circle, 6.829 in the "read the papers" circle, CS168 and COS 461 in the "operate it" circle, and the Coursera specialisation in the "cloud" circle — with overlaps where appropriate.
