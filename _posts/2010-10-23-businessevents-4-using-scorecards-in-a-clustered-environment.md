---
title: 'BusinessEvents 4: using Scorecards in a clustered environment'
date: 2010-10-23T20:43:18+00:00
layout: post
tags:
  - BusinessEvents
  - TIBCO
---
Scorecards have a special purpose in TIBCO BE. There are often used for static (as in Java-style static) values which should be globally accessible through the whole engine. As Java statics, TIBCO describes its main purpose in instance dependent Variables which are only valid in the context of one Processing Unit in an Inference engine.

Here a little citation of the TIBCO documentation on this topic (p.144 – Understanding and Working With Scorecards):

> A scorecard is a special type of concept. A scorecard serves as a set of static
> variables that is available throughout the project.<br>
> ...<br>
> It is more accurate to say there is one instance of a scorecard per inference agent.
> Each inference agent in an application has its own instance of the score card.
> Scorecards are not shared between agents.<br>

So you can use Scorecards without any Issues as long as you consider the per Instance rule. Now I have a project where Timeouts are calculated an stored in Scorecards. This solution works perfectly in single instance environment because of the special behavior described above. Now there comes a new Requirement into the project. The Agents should be clustered over 2 Instances to ensure high availability. This really ruins the simplicity of the scorecard approach.

Digging a little deeper into the documentation I came to the conclusion that all the scorecards had to be stored in the cache-server. Knowing this, it came to me mind that the only thing I must accomplish would be, that all inference agents use the same instance of the scorecard.

To achieve the single Instance per Agent approach, TIBCO uses Instance keys for every Processing Unit. So if you could change this instance key, all agents had to us the same instance of the scorecards and the timeout-solution would still work. Searching the documentation the answer was also found really quickly on page 144 (Understanding and Working With Scorecards).

On that page TIBCO described how to set this instance key via CDD.

> Any agent that uses scorecards, and also uses Cache Manager, must be assigned a
> unique key so that the correct scorecard can be retrieved from the cache. The key
> is set in the Processing Unit tab of the CDD.

I also tried this approach on a little test project and it worked right away.

What this means is, you can change the behavior of Scorecards depending on your needs. If you need a per Instance Variable you just have to set different Instance keys for every Agent. On the other hand if you want a globally shared Variable you can achieve this by setting the same value to all instances.
