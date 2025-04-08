# Playwright scripts to pull jobs and save as markdown in PM Jobs Folder

[X] [Indeed](https://www.indeed.com/)
[X] [LinkedIn](https://www.linkedin.com/)
[ ] [Glassdoor](https://www.glassdoor.com/Community/index.htm)
[ ] [FlexJobs](https://www.flexjobs.com/)
[ ] [Remote.co](https://remote.co/)
[ ] [We Work Remotely](https://weworkremotely.com/)
[ ] [SimplyHired](https://www.simplyhired.com/)
[ ] [ZipRecruiter](https://www.ziprecruiter.com/jobseeker/home)
[ ] [TechCareers](https://www.techcareers.com/)
[ ] [Get On Board](https://www.getonbrd.com/applications)
[ ] [HackerRank](https://www.hackerrank.com/apply)
[ ] [Wellfound](https://wellfound.com/jobs)
[ ] [Kforce](https://www.kforce.com/)
[ ] [Dice](https://www.dice.com/home-feed)
[ ] [CareerOneStop](https://www.careeronestop.org/)
[ ] [My Next Move](https://www.mynextmove.org/)
[ ] [O*NET Online](https://www.onetonline.org/)
[ ] [Toast Careers](https://careers.toasttab.com/jobs/search?query=Full+Stack+Engineer)
[ ] [Branded Resumes](https://dashboard.brandedresumes.com/review/67dc34b93b69d30013aeed1b)
[ ] [TrueUp](https://www.trueup.io/myjobs)


##### TODO
- Move Config stuff to shared location
- Add Websocket so we can see progress in frontend

## Open Chrome
- Indeed requires reusing Chrome in debug mode, where we can use background
- If debug mode, use first tab

## Load Cache and Exciting Job IDs
- Indeed pulls info in two steps
  1. Find new jobs from list of jobs and save the ID's to a file list
  2. Pull job details

## Foreach Search term
- "Backend Developer", "Frontend Developer", "PHP Developer", "Senior Full Stack Engineer", "Senior Full Stack Developer", "Web Developer"

### Foreach Page
- Each Job ID from the list of jobs

## Foreach Job in Job list
- GOTO Detail Page, then pull job details and save to markdown table.
