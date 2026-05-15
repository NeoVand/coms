---
id: ports-sockets
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: Ports & Sockets
synopsis: How one machine runs a hundred services without confusing them.
podcast_target_minutes: 15
position_in_book: 5 of 75
listening_order:
  prev: foundations/packets
  next: foundations/reliability-speed
related_protocols: [wifi, ip, ethernet, ssh, tcp, udp, dns, http1, smtp, ipv6, http2, grpc, ftp, quic, http3, tls]
related_pioneers: [tim-berners-lee]
related_outages: []
related_frontier: []
related_rfcs: []
images:
  - { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/TCP_Header.svg/500px-TCP_Header.svg.png", caption: "The TCP segment header. The first row is the two 16-bit port fields the OS uses to demultiplex an arriving segment to a process.", credit: "Wikimedia Commons / CC BY-SA 3.0" }
  - { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/InternetSocketBasicDiagram_zhtw.png/500px-InternetSocketBasicDiagram_zhtw.png", caption: "The Berkeley sockets API: server calls socket, bind, listen, accept; client calls socket and connect; then both sides read and write bytes like a file.", credit: "Wikimedia Commons / public domain" }
visual_cues:
  - "A laptop with a single Wi-Fi card and one IP address fanning out into a dozen labelled processes — browser, SSH, Slack, Spotify, Postgres, background updaters — each tagged with the destination port the OS uses to route packets to it."
  - "The TCP segment header zoomed in on the first 32 bits: a 16-bit source port box next to a 16-bit destination port box, with arrows from those boxes into the kernel's socket table."
  - "A four-tuple chalkboard: source IP, source port, destination IP, destination port — with hundreds of ESTABLISHED rows beneath it, all sharing the same local *:443 endpoint and each pointing at a different remote pair."
  - "A timeline of well-known port choices: 1991 Tim Berners-Lee picks 80 for HTTP, 1994 IANA assigns 443 for HTTPS, 1995 Tatu Ylonen picks 22 for SSH because it sat between Telnet on 23 and FTP on 21."
  - "An nginx load balancer terminating one TLS connection on port 443 from a client, then opening a separate outbound connection to one of N backend servers — two TCP sockets stitched together in user space, the client's source IP replaced by the load balancer's."
---

# Part I, Chapter — Ports & Sockets

## The hook

Your laptop has one Wi-Fi card, one IP address from your router, and one Ethernet cable to your switch. And yet right now it is running a web browser, an SSH client, a Slack daemon, a Spotify player, half a dozen background updaters, and a Postgres server, all talking to the network at the same time. Something has to demultiplex the packets that arrive on that one wire and hand each one to the right process. That something is a sixteen-bit number called a port.

## The story

### A Hundred Services On One Wire

The trick is small enough to fit in two bytes. A port is a 16-bit unsigned integer, somewhere from 0 to 65535, that lives in the TCP or UDP header alongside a similar field naming the source. When a packet arrives at the host, the operating system looks up the protocol-and-destination-port pair in its socket table and hands the payload to the matching process. Different processes own different ports. Ports are how the OS carves one network identity into many independent endpoints.

There are three conventional ranges, and the boundaries are worth knowing because they shape who is allowed to bind what. Well-known ports run from 0 to 1023, are reserved for standard protocols, and on Unix require root or admin privileges to bind. Port 22 is SSH. Port 53 is DNS. Port 80 is HTTP. Port 443 is HTTPS. Port 25 is SMTP. Each of those is a separate episode, but the addressing convention is the part that belongs in this chapter. Registered ports run from 1024 through 49151 and are assigned by IANA, the Internet Assigned Numbers Authority, to specific applications by convention rather than by enforcement. Postgres is 5432. Redis is 6379. HTTP-alt is 8080. Ephemeral ports run from 49152 to 65535 on most operating systems, and the kernel hands them out on the fly to the client side of an outgoing connection. When your browser dials out, it picks one of those at random.

### Sockets, and the Magic Four-Tuple

A socket is the operating-system abstraction that ties a network endpoint to a file descriptor. On Linux, you create one with the socket system call, configure the protocol — TCP or UDP — and the address family — IPv4 or IPv6 — bind it to a local address and port, and then either listen for incoming connections on the server side or connect to a remote endpoint on the client side. Once established, you read and write bytes from the socket the same way you read and write a file. That API has been the universal Unix interface for network input and output since 1983.

Now the deep insight. A TCP connection is uniquely identified not by a port, but by a four-tuple — source IP, source port, destination IP, destination port. This is the design choice that makes the modern internet practical. A web server bound to port 443 can serve thousands of clients simultaneously, because each client connection has a different source IP or a different source port, and all of them are legitimately distinguishable as separate connections to the same listening socket. The mechanism details — sequence numbers, acknowledgements, the three-way handshake — belong to the TCP episode. What matters here is the addressing.

If you want to see the table for yourself, run ss -t or netstat -t on a busy server. Hundreds of rows in ESTABLISHED state, all sharing the same local star-colon-443 endpoint, each one pointing at a different remote IP and port. The kernel maintains a hash table indexed on the four-tuple, and every arriving segment is dispatched in constant time to its connection.

There is a subtle penalty for all this. After a TCP connection closes, the local OS holds the four-tuple in TIME_WAIT state for about sixty seconds — twice the maximum segment lifetime. The reason is paranoia about stragglers. A packet from the old connection that has been delayed in the network for thirty seconds could otherwise re-enter a freshly-opened connection on the same four-tuple and be misinterpreted as legitimate data. On servers with thousands of short-lived connections per second this can exhaust the ephemeral port range. The cure is connection reuse — HTTP keep-alive, HTTP/2 multiplexing, gRPC connection pooling. Each of those mechanisms gets its own episode. The reason they exist is the four-tuple bookkeeping you just heard.

### Why Port 80, Port 443, Port 22

The well-known ports look arbitrary, and many of them are. Port 80 for HTTP was picked by Tim Berners-Lee in 1991 — the comment in his early code reads "80 because that was available and we needed a number." Port 22 for SSH was picked by Tatu Ylonen in 1995 because it sat between Telnet on 23 and FTP on 21. Port 443 for HTTPS was assigned by IANA in 1994 when Netscape introduced SSL.

Once chosen, well-known ports are impossible to change. Every firewall in the world has a rule allowing outbound 443. Every CDN, every load balancer, every browser bookmark, every anchor href written without an explicit port assumes 443 for HTTPS. A protocol that wanted to switch ports today would have to coordinate the rewrite across the entire deployed internet, which is why nobody seriously tries. This is also why QUIC, the transport behind HTTP/3, runs over UDP port 443. By squatting on the same well-known number that HTTPS already uses, it inherits the firewall traversal that HTTPS earned over thirty years. The choice of port number is itself a deployment decision. The QUIC episode picks up the rest of that story.

There is one more piece of the addressing story that anyone who has ever debugged a production deployment runs into, and it lives at the port layer. A load balancer like nginx or HAProxy binds to port 443, accepts the inbound TCP and TLS connection from the client, and then opens a separate outbound connection to one of N backend servers. From the client's perspective there is one connection. From the backends' perspective there are many. The two halves are stitched together in user space. Which is why the source IP that arrives at the backend is the load balancer's, not the original client's, unless you explicitly forward it via the PROXY protocol or an HTTP header like X-Forwarded-For. The mechanism details belong to whichever load balancer you happen to run. The reason it exists belongs to this chapter.

## The figures

### Tim Berners-Lee

Berners-Lee created HTTP, HTML, and URLs at CERN between 1989 and 1991 — the three pillars of the web. He built the first web browser and the first web server on a NeXT cube, and the first website went live by Christmas 1990. CERN released the technology royalty-free on the thirtieth of April 1993. He founded the World Wide Web Consortium in 1994 and continues to direct it from MIT. The reason he belongs in this chapter is one tiny decision he made early on — the comment in his code that reads "80 because that was available and we needed a number." That arbitrary pick became one of the half-dozen permanent landmarks of the deployed internet. There is a separate episode on Berners-Lee, and the HTTP/1.1 episode picks up the protocol he designed.

## Listening order

- **Before this chapter:** "Packets & Encapsulation" — the previous chapter explains how application data is wrapped in TCP, IP, and Ethernet headers as it goes down the stack. This chapter picks up at the next layer of the same question: once that packet arrives, which process gets it.
- **After this chapter:** "Reliability vs Speed" — the next chapter takes the TCP-versus-UDP split you just heard and turns it into the central tradeoff that shapes every transport choice on the modern internet.

## Where to go deeper

- The TCP episode picks up the mechanism story — the three-way handshake, sequence numbers, retransmission, congestion control from Tahoe and Reno through CUBIC and BBR.
- The UDP episode covers the fire-and-forget alternative — no handshake, no retransmission, an eight-byte header, and why DNS, gaming, and live media depend on it.
- The QUIC episode explains why a brand-new transport runs over UDP port 443 instead of asking for its own protocol number, and how it folds TLS into the transport handshake.
- The TLS episode covers what happens once a client opens a socket to port 443 — the 1-RTT handshake of TLS 1.3, certificates, and the lock icon in the browser.
- The HTTP/2 episode picks up the multiplexing story — how many streams ride one TCP connection, and why that still leaves head-of-line blocking at the transport layer.
- The DNS episode covers the lookup that happens before any of the above — how a domain name turns into the IP address your browser then dials on port 443.
- The SSH episode picks up port 22 and the encrypted shell, key authentication, and port-forwarding tunnels.
- The IPv6 episode covers the addressing layer beneath the port — 128-bit addresses, the fixed 40-byte header, and the slow but real transition that crossed fifty percent of Google's traffic on the twenty-eighth of March 2026.

## Visual cues for image generation

- A laptop with a single Wi-Fi card and one IP address fanning out into a dozen labelled processes — browser, SSH, Slack, Spotify, Postgres, background updaters — each tagged with the destination port the OS uses to route packets to it.
- The TCP segment header zoomed in on the first 32 bits: a 16-bit source port box next to a 16-bit destination port box, with arrows from those boxes into the kernel's socket table.
- A four-tuple chalkboard: source IP, source port, destination IP, destination port — with hundreds of ESTABLISHED rows beneath it, all sharing the same local star-colon-443 endpoint and each pointing at a different remote pair.
- A timeline of well-known port choices: 1991 Berners-Lee picks 80, 1994 IANA assigns 443, 1995 Ylonen picks 22 because it sat between Telnet on 23 and FTP on 21.
- An nginx box terminating one TLS connection on port 443 from a client, then opening a separate outbound connection to one of N backend servers — two TCP sockets stitched together in user space, the client's source IP replaced by the load balancer's.
