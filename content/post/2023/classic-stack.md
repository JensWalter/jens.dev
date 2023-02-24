---
title:  "The Classic BusinessWorks Stack"
date:   2023-05-20T10:08:54Z
tags:
 - tibco
 - cloud
---
Since I already defined the software stack as a whole, let define how things worked before the migration started.

# How Sources and Dependencies are kept.

All sources where located in one big mono-repo.
This repo defined engines, which followed the definition of backend systems.
So for every system (with all of its services) we hade one source project present.
Shared functionality was distributed through project-libraries, so it can be pulled into multple engines.

# How to build stuff.

The CI pipeline in use is Jenkins. Every time a checkin in happening a Jenkins job is trigger to build a zip file which contains the following definitions:
- ems queues/topics
- file shares (required directories for testing)
- database script
- EAR file for Tibco Administrator
- files for local file system patches

[jenkins-ci]

While this applies to every since engine, the need arose early to also define composites (multiple engines).
Composites are also defined through sources repositories. Those repositories only consist of versioned depenendencies, but have no code of their own. This way we could re-use the exising pipelines and architecture.

# How stuff is rolled out.

[jenkins-rollout]

Every environment had its own definition file as jenkins job definition.
This definition file covers settings like:
- database url/credentials
- Tibco EMS url/credentials
- Tibco Administrator url/credentials
- Machine list (used for file rollout)
- installed software list
- additional feature list
    - has DMZ support
    - is setup as cluster/singe instance
    - has regions

Through the jenkins UI we could select an environment first. Depending on the selected environment and therefore feature present on that environment we coudl trigger tasks to be performed.

Tasks supported by our Jenkins jobs:
- restart environment
- rollout software (install/update EMS, BW, third party components)
- deploy Single engine
    - deploy database script
    - EMS definitions, Queue, Topics, Bridges, Routes
    - prepare Fileshares
    - deploy BW EAR through Administrator
    - run filesystem rollout (e.g. SSL certificates, config files)
- deploy composite (just a collection of multiple engines)