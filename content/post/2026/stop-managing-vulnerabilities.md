---
title: "Stop managing vulnerabilities, start owning the response"
date: 2026-11-25
description: "Some thoughts on why patching CVEs team by team no longer works when critical ones arrive daily, and why a small permanent team with both technical and organisational ownership could close that gap."
tags:
- cve
- conceptual
---
## Groundhog Day

Looking at the current state of software security, the thing that changed the most in the last years is the pace. CVEs with a score above 9.0 come out practically every day, and the software vendors follow the same rhythm: patches no longer arrive with the next quarterly release, they get sent out daily.

What did not change is the way most companies operate around this. In most of them, CVEs and patches are implemented by the product teams, each team for the software it owns, and somewhere in between the work it actually planned. Sometimes a security team sits in front of that and is responsible for the notification, it reads the advisories and opens the tickets. And quite often not even that exists, and nobody is explicitly tasked with the oversight at all.

This mode of operation comes from a time when a critical vulnerability was the exception, something that happened a few times a year and could be handled by interrupting whoever was closest. With a daily stream it no longer works. Every product team has to notice, assess and schedule the same CVE on its own, with its own priorities and its own idea of urgency, and at the end of the day nobody can say whether the organisation as a whole is still exposed. And the next morning the same thing starts over, with the next CVE.

I do not have to look far for an example, because the project I am working in right now is living this. GitLab patches come in two to three times a week, Artifactory patches weekly, and that is just the tooling everything else is built with. Next to this base load there are the CVEs with a long tail, like the recent PHP2Shell. It started with a rebuild of our own projects, continued with patches for third-party software, and propagated all the way down to hardware and appliances, with NetApp patching its admin interface. A chain like that does not belong to any single product team.

I also know both seats in this picture. I have been the one receiving the tickets, with a severity score, a deadline and not much else. And I have been the one driving a response across several teams, knowing fairly well what had to happen technically, and having no mandate to make it happen. Log4Shell was the big one, but OpenSSH, OpenSSL, Bash and recently nginx all went the same way.

## Three owners, no owner

If I take this mode of operation apart, I find three kinds of ownership sitting with three different groups, and a fourth one that sits with nobody.

![Today: a critical CVE arrives every day, a security team notifies if there is one, every product team assesses, schedules and patches on its own, management decides what gets dropped, and nobody owns the question whether the organisation is still exposed](/assets/2026/cve-response-today.svg)

Every arrow in that picture is a handoff. The security team passes on a link, a jira ticket and a score, but not the judgment whether this CVE actually matters for this product. The product team has to explain to management why a ticket with a score of 9.8 is either a real emergency or does not apply at all. Every one of those handoffs costs time and context, and at the end a technical problem has turned into an organisational negotiation, in which the people who understand the problem best have the least say in how it gets solved.

And honestly, we became very good at the wrong part of this. There is impressive tooling to find vulnerabilities, to score them, to assign them and to track them against a deadline. But all of that manages the vulnerability, none of it owns the response. The security team is measured on what it reports, the product teams on the tickets they close, and whether the organisation is actually no longer exploitable is a question that belongs to nobody in particular.

## The big red button

What made me think about this again was a talk from AWS. At re:Invent 2022, Abby Fuller [described how AWS handled Log4Shell](https://www.youtube.com/watch?v=pkPkm7W6rGg), and part of that talk is about an internal group they call Ghostbusters: a handful of security-minded principal engineers from across AWS, used, as the slides put it, as "a security big red button".

The normal case at AWS looks like everywhere else. A security operations team, staffed around the clock, triages incoming issues and works with the service teams on a fix. But if an issue has potentially high impact, or if the honest answer is simply "I'm not sure", Ghostbusters gets paged and a call is opened. The issue counts as a big deal until proven otherwise. And if it turns out to be one, Ghostbusters takes over the event and leadership gets engaged.

For Log4Shell the slides contain a timeline, and it is worth reading. On December 9, 2021, the first Ghostbusters ticket was cut at 07:40, the same time the slides give for the first mention on Twitter. Before noon the first mitigation was rolling out. At 13:22 the group opened the call that would run continuously for nearly three days. And at 19:00 a change control took effect: other builds and deployments were paused in favor of the Log4j response, and overriding that needed leadership approval. From a tweet in the morning to a reprioritized deployment pipeline in the evening.

What I find remarkable is not the speed, the speed is a consequence. It is who was leading. The people who understood the vulnerability were the people running the response, and they had a direct line to the leadership that could pause everything else. Nobody had to translate the problem upward through three layers before something happened. How much of that authority formally belongs to the group, the public material does not say, and I do not want to read more into a slide deck than it contains. But the direction is clear enough: technical judgment and organisational weight in the same hands.

## A second job

There is one detail in that talk I keep coming back to, because it is where I part ways with the model. The introduction describes the day job as mostly security for EC2, and Ghostbusters as something done in addition to it. The big red button is a second job, carried by senior people who already have a first one.

That is a federation of seniors, and most organisations run some informal version of it: when something big happens, the three or four most experienced people get pulled into a room. For AWS, with a complete security operations team in front of it and the button reserved for the extraordinary, this may work fine. As a general model, I think it is the old model, and I think it stopped working. For four reasons.

The first is split attention. Those seniors have a main job, a team and a roadmap of their own, and nobody planned capacity for the second job. During the response their own work stops, after the response they have to catch up, and the follow-up work, the part where the cause gets removed and not only the symptom, loses against the roadmap every single time.

The second is volume. A red button assumes that pressing it is a rare event. But with critical CVEs arriving daily, there is always one that needs at least an assessment, and a construct made of borrowed people cannot absorb a steady stream.

The third is time. With Log4Shell, the mass scanning started within hours of the first public mention. That window between disclosure and exploitation keeps shrinking, and since attackers have access to the same AI tooling as everybody else, I do not see it growing again. If the response starts with finding out who is available this week, a good part of the window is already gone.

The fourth is knowledge. Attacks became more complex, a supply chain compromise or a chain of three medium findings is nothing to assess on the side. And the response itself became a regulated activity. NIS2 and the Cyber Resilience Act both put a 24 hour clock on the first report, and knowing what has to be reported to whom, while the technical picture is still incomplete, is dedicated knowledge. It does not come for free with being a good engineer.

## What about incident commanders?

To be fair, the industry does have an answer for emergencies that cross team boundaries, it just comes from the reliability side. The incident command model, the way Google, PagerDuty or Slack describe it, puts a trained coordinator in charge of an incident. The commander finds the right experts, keeps the call organized and removes obstacles, and is deliberately not the person fixing the problem.

For an outage I think this works well. Something is broken, the broken thing has an owner, and the goal is to get it running again. A CVE has a different shape. Nothing is broken, every team is affected a little, and the decisive questions are technical judgment calls: are we exploitable at all, is a configuration change enough or do we need the patch, which systems go first. A coordinator who cannot make those calls has to ask somebody who can, and there is the handoff again, this time inside the call.

The other construct I found is exceptional authority. Google has its Code Yellow and Code Red, Cloudflare borrowed the idea and declared a Code Orange after its data center outage in 2023, and the core is always that one leader may pull engineers from anywhere in the company onto the most urgent work. That is the authority part of what I am looking for. But it gets declared after something went badly wrong, and it is temporary by design.

Microsoft went a step further after its own security incidents and named deputy CISOs inside the engineering organisation, senior technical leaders who carry the security accountability for their product area. That is probably the closest anybody has publicly come to putting both kinds of ownership into the same people, but each of them is bound to one domain.

So the pieces all exist somewhere. Expertise on call at AWS, coordination in the incident command model, authority in a Code Orange. What I did not find is the combination of the three as a standing construct for security. Maybe it exists and nobody writes about it, I would genuinely like to hear about it. But from the outside it looks like we are still splitting technical and organisational ownership, in a world where the next critical CVE is never more than a day away.

## A team that owns the response

So here is the construct I would like to see: a small, permanent team whose job is the response. A handful of people for whom this is the first job and not the second.

The important word is owns. This team does not advise, and it does not open tickets for other people and track them. When a relevant CVE appears, the team decides whether the organisation is affected, decides what has to happen, makes it happen, and stays on it until the fix is verified in production. The outcome has one owner, from the first mention to the last patched system.

And to own a response, the team needs both kinds of leadership that were spread over three groups before. It needs the technical depth to judge the vulnerability on its own, and it needs the organisational mandate to act on that judgment without asking for permission in the middle of the incident.

![With a response team: one small, permanent team holds the technical and the organisational leadership, assesses once and gives one answer to all product teams, the product teams patch, and the response team owns the question whether the organisation is still exposed](/assets/2026/cve-response-team.svg)

## The mandate

The mandate has to be concrete, otherwise it is worth nothing in the one moment it is needed. I think it comes down to three rights, agreed upfront and in writing:

```text
redirect people       pull engineers off their roadmap for a response
patch foreign code    commit and deploy fixes in services the team does not own
pull the plug         isolate or disable a service that cannot be fixed in time
```

I know how that sounds. A team that can take people away from their managers, change code it does not own and switch off somebody else's service looks like a shadow hierarchy, and without limits it would be one. So the limits belong to the mandate just as much as the rights do.

The rights exist only inside a declared response. A response has a start, somebody declares it and everybody can see that it is running, and it has an end, at which the borrowed people go back to their teams. Every use of a right is visible and gets reviewed afterwards, the same way we review an outage. And the team never becomes the owner of what it touches. The product team owns its service before and after, the response team owns the response. A patch in foreign code is a normal commit, the owning team can see it, question it, and replace it with something better once the pressure is gone.

AWS did a version of this during Log4Shell, by the way. On-calls were paged into the call regardless of working hours, other builds and deployments were paused, and a hotpatch was deployed on behalf of the service teams, something the talk itself calls unusual. The difference is that it took an event of that size to make it acceptable. I would like it to be the agreed way of working before the event.

## Same people, or a sponsor

Where should the mandate sit? My clear preference is in the same people. Every member of the team is a senior engineer who holds the mandate personally, so the person who understands the exploit is also the person who says that a service goes offline until it is patched. No translation, no approval round, no handoff.

I am aware that many organisations cannot do this. Giving engineers authority over other managers' people cuts across the way most companies separated the technical career from the management career, and that separation does not go away because of a blog post. In that case, a dedicated sponsor at C-level is a must. One named person, not a steering committee, who agreed to the three rights upfront and who backs every call the team makes while a response is running. If the team has to win an argument with a VP during the incident, the mandate was decoration.

What does not work is the version without either. A response team with deep expertise and no mandate is a group of well-informed advisors, and advisors we already have.

## Between the incidents

The obvious objection to a permanent team is cost: what do these people do when nothing is burning? Part of the answer is at the very top of this post: with a critical CVE coming out every day, there is not much quiet time, and assessing that stream once for the whole organisation is a job on its own. But the more interesting part of the answer is the scope, because I would not limit this team to reacting.

Every response leaves a list behind. The dependency that took days to locate because nobody knew where it was running. The base image every team keeps a private copy of. The deployment pipeline that needs a week to roll out a one-line change. These are not single vulnerabilities, they are classes of risk, and today they end up as recommendations in a retrospective and then lose against the roadmap.

I would give those classes to the same team, with the same kind of ownership. The mission is not to recommend that teams update a library, it is to own that the library is gone from the fleet, including the work, the priorities and the verification. The team that suffered through the last response knows best what would have shortened it, and it is the only team with a selfish interest in the next response being boring.

This also changes what gets counted. Findings opened and tickets closed stop being the interesting numbers. What counts is how much exposure was actually removed, how long it took from disclosure to a verified fix, and whether the same class of problem can come back.

## What stays with the teams

None of this takes the products away from the product teams, and I want to be precise here because the idea is easy to misread. The hands-on work largely stays where it is. Updating dependencies, rolling out a vendor patch, fixing what the scanner finds in their own code, most of that will still be done by the people who know the product.

What moves is the part that today sits with nobody. The response team reads the daily stream, decides once for the whole organisation whether a CVE matters and how urgent it is, and follows it until the fix is verified everywhere. A product team no longer has to find out on its own whether a 9.8 is an emergency, it gets an answer instead of a score.

The mandate comes into play for what this normal flow cannot handle: the CVE that hits everybody at once, the product team that cannot fix in time, and the risk classes that cross every team boundary. For everything else the response team depends on the goodwill of the same teams it may have to override next month, which is a good reason to use the mandate carefully.

## The open points

I do not want to pretend this is finished thinking, there are at least three places where I have no good answer yet.

The first is people. The team needs engineers who can read an exploit, find their way through a foreign codebase, and also tell a VP that the launch is moving. That combination is rare, and a team built on rare people is small and fragile. What happens when two of them leave is a fair question.

The second is power. The right to pull the plug is in the end a business decision made by engineers, and the review afterwards does not bring back the hours a service was offline. I think the answer lies in the limits described above and in the sponsor, but I can imagine organisations where this one right kills the whole proposal.

The third is the lower bound. In a company with thirty engineers, a permanent team is one person, maybe two, and one person is not a team and is certainly not available around the clock. I do not know yet where the model stops making sense, or what the small version of it looks like.

And there is a risk I can only name, not solve: that the product teams read the existence of such a team as "security is handled elsewhere now". The scope from the previous section is my attempt to prevent that, but culture does not always read the scope.

## So, who owns the response?

For the notification, a security team, if there is one. For the patch, the product teams. For the priorities, management. And for the response as a whole, in most organisations, nobody. It is whatever happens in the gaps between the other three.

I think that is no longer good enough. We have built impressive machinery to manage vulnerabilities, to find them, score them, track them and report on them, and we still improvise the one part that actually reduces risk. A small permanent team that understands the problem and is allowed to act on it would be my way of closing that gap.

There is a simple test for this. If a critical CVE lands tomorrow morning, is there somebody in your organisation who understands it well enough to make the technical decisions, and who also has the authority to make the organisation act? If those are two different people, the response starts with a meeting.
