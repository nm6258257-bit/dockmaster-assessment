D O C K M A S T E R
AI Product Lead
Practical Project  ·  AI-first e-signature build
Stage
Project stage. Follows the first interview.
Released
Thursday 1 October 2026
Due
Sunday 4 October 2026, 11:59pm your local time
Presentation
Monday 5 October 2026  ·  30 minutes  ·  live Teams meeting
You will meet
Karen Barnes, CEO of DockMaster, and Scott Taylor, COO of DockMaster
Expected effort
10 to 15 hours. Please do not exceed it.
Compensation
Unpaid. Anything you build remains entirely yours.
What we are asking you to build
A working e-signature product in which AI does the setup work.
The distinction matters, so here it is plainly. In a conventional e-signature tool, the sender assembles the document: drag a signature box here, a date field there, type in each signer’s name and email, decide the order. The software is a form builder and the human does the thinking.
We want the opposite. The product should read the uploaded PDF and work out who needs to sign it, what each of those people needs to fill in, and where on the page each of those fields belongs. The sender’s job becomes reviewing and correcting a proposal rather than building one from nothing.
The bar:
A faithful clone of an existing e-signature tool is not a pass, however well built.
Neither is a conventional form builder with an AI button bolted onto the side.
The test is simple: take the AI out of what you built. If the product is barely any worse to use, the AI was decoration.
Scope
Three tiers. Work down them in order. Read the note at the end of this section before you start planning — it matters more than the list.
Core — we expect these to work
1.   Account creation and sign-in
Any approach. Magic links, passwords, a social provider — whatever is fastest. This is not what we are assessing.
2.   Upload a PDF
3.   The AI reads the document and proposes the whole setup
Who the parties are and what role each plays. What fields each party needs. Where on the page each field goes, and on which page. This is the centre of the project.
4.   The sender can accept, correct, add or remove anything the AI proposed
A proposal the sender cannot fix is worse than no proposal. Correcting a wrong guess should be faster than starting from scratch.
5.   Designate signers — self only, self plus others, or others only
6.   Send for signature, and signers can actually complete it
The recipient journey has to work end to end, not just the sender’s. Field types: signature, text, checkbox, radio. Support all four if you can; signature and text are the minimum.
Next — the first thing to add once core works
7.   Email notification to every party at the moments that matter
Sent, it is your turn, and completed, at minimum. Real delivery is nice to have. A visible outbox or log showing exactly what would be sent, to whom and when is equally acceptable and costs you nothing in our assessment — we would rather you spent the hour elsewhere.
Optional — do not begin any of these until core works
Manual drag-and-drop placement and resizing of fields
Audit trail or completion certificate
More than one document in a single envelope
Signing order and sequential routing
Reminders, expiry, decline-to-sign
Mobile layout
Anything else you think we have missed and would be better for having
You will not finish all of this, and that is deliberate.
The list is longer than the time. We would rather see six things working properly than eleven things half-built, and a product that does less but holds together will score better than one that does more and falls over.
How you decide what to cut is part of what we are assessing — arguably the most transferable part, because it is what this job is every week. Write your decisions down as you make them. We will ask you about the last thing you cut and why.
Constraints and ground rules
Build it however you like
Any stack, any language, any framework, any hosting. Use whatever gets you furthest fastest — there are no points for a technology choice, only for what it produced.
Any model or AI API. If running it costs money, note roughly what one document costs to process. We care about unit economics and we will ask.
Libraries, templates, boilerplate and starter kits are all fine.
Use AI coding tools — we expect it
This company runs on them and we would be surprised, and a little concerned, if you did not. There is no penalty of any kind and no virtue in doing it the hard way.
What we will ask is how. Which parts you handed over, where you had to take the work back, what the tools got wrong, and how you verified what they produced. Keep enough of a note to answer that well.
Test documents are yours to choose
Use real-world paperwork rather than placeholder text — a lease, an NDA, a service agreement, a waiver, an offer letter. Real documents have the messiness that makes this problem interesting.
We will test it with a PDF you have never seen.
In the Monday session Karen will upload her own document, chosen in advance and not shared with you, and work through the product while you watch. This is the same for every candidate and we are telling you now so you can build for it.
Build for the general case. A product tuned to the three PDFs you happened to test with will be visible within about ninety seconds, and how you respond when it struggles is itself something we are looking at.
Your own work
Fine: libraries, open-source components, templates, AI assistance of any kind, and asking us questions. Not fine: submitting something you had already built before receiving this brief.
What to submit
By 11:59pm your local time on Sunday 4 October, email karen.barnes@aspiresoftware.com with:
Item
Detail
A live URL
Something we can open in a browser and use. Not a local dev server, not a video of one. Free hosting is entirely fine.
Access
Working credentials, or self-serve signup that works. Please test this from a private browser window before you send it.
The code
A repository link, or a zip. Private repo is fine — send an invite to the address above.
A README
One page maximum. See below for what to put in it.
A 5-minute recording
A screen recording walking through the product end to end, as a real user would meet it. Five minutes, hard limit. Loom, a Zoom recording, anything we can watch. Rough and unedited is completely fine — do not ‘produce’ this.
The recording replaces a live walkthrough. We watch it before Monday so the session itself can go on the things a video cannot give us.
The README — one page, five things
What works.
What does not work, or is faked. Say so plainly. We will find it anyway, and finding it ourselves after you implied otherwise is much worse than being told.
What you cut, and why. The reasoning matters more than the list.
How the AI layer actually works — what you send it, what comes back, and how you turned that into field positions on a page.
What one document costs to process, roughly.
No slide deck, and please do not build one. We are assessing what you built. Time spent on presentation materials is time not spent on the product, and we would rather have the product.
The Monday session — 30 minutes
Live video with Karen Barnes and Scott Taylor, COO of DockMaster. We will both have watched your recording beforehand, so there is no walkthrough on the call. Two parts:
Time
What happens
Detail
12 min
We drive
Karen shares her screen, uploads a document you have not seen, and works through it herself while you watch. Expect her to try to break it. You are welcome to comment, but she will not hand over the keyboard.
18 min
Questions
With Karen and Scott. About the build, the decisions behind it, and how you would take it forward commercially and operationally.
Please have the product open and a fresh account ready at the start. The thirty minutes begins on time and none of it is setup.
Come ready to talk about
The session is short, so these are the five we will almost certainly get to:
Why you scoped it the way you did, and the last thing you cut before the deadline.
Where the AI gets it wrong, how often, and how you know. We would rather hear a clear-eyed account of the failure modes than a claim that there are none.
What one document costs to process, and what that becomes at ten thousand documents a month.
What you would build next given three more weeks and one engineer.
Who handles it, and how, when this gets something wrong on a real customer’s paperwork.
If there is time we will also ask how you used AI coding tools and where you had to take over, and whether you would charge for this or include it.
How we will assess it
In rough order of weight. We are telling you this so you can spend your time in the right places.
What we are looking at
Weight
In practice
Does the AI genuinely do the work
30%
On a document it has never seen, how much of the setup does it get right, and how much is left for the human? Removing the AI should visibly break the product.
Does it work in someone else’s hands
25%
Karen will use it cold, without you touching the keyboard. Does the whole journey complete — upload, review, send, sign, notify — without you narrating around a problem?
Scoping judgment
20%
What you chose to build, what you chose to leave, and whether you can defend both. Finishing a coherent subset beats starting everything.
How it handles being wrong
15%
It will be wrong sometimes. Does the product make that visible and cheap to fix, or does it present a guess with unearned confidence?
Product instinct
10%
The small decisions — what you show first, what you hid, what you made impossible to get wrong. Evidence you thought about the person using this.
What we are not scoring
So you can stop worrying about them:
Visual polish beyond being usable. Clean and plain is fine. Beautiful is not worth an hour taken from the AI layer.
Test coverage, CI, containerisation, or any production infrastructure.
Security hardening beyond not doing anything obviously alarming.
Legal compliance. This is not a real e-signature product and nothing you build needs to satisfy ESIGN, UETA or eIDAS.
Scale. One user at a time is fine.
Questions
Email Karen at karen.barnes@aspiresoftware.com. Ask as many as you like — asking good questions counts in your favor rather than against it.
Every answer goes to every candidate, with the question anonymized, so nobody gains an advantage by asking and nobody loses one by staying quiet. Karen is travelling during part of this window, so allow up to a day for a reply. If something is genuinely blocking you and you have not heard back, make a sensible assumption, note it in your README, and carry on.
One last thing.
This brief is deliberately larger than four days. We are not trying to catch you out, and nobody is expected to deliver all of it. We are interested in what you choose, what you get working, and how you talk about the gap between the two — because that is the actual job.
Good luck. We are looking forward to seeing it.
