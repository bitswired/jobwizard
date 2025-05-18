# JobWizard: AI-Powered Job Application Automation

## Overview
JobWizard is an AI-driven web application that revolutionizes the job search process, drastically reducing time and boosting application success rates. By automating job offer discovery and generating personalized cover letters, JobWizard empowers job seekers to focus on their career goals while the system handles the heavy lifting. Built for the [Bright Data Real-Time AI Agents Challenge](https://dev.to/devteam/join-the-bright-data-real-time-ai-agents-challenge-3000-in-prizes-cog), JobWizard leverages Bright Data’s MCP server to seamlessly discover, access, extract, and interact with real-time web data, delivering tailored job matches and compelling cover letters with unmatched precision.

### Problem Solved
Job searching is time-consuming and often discouraging, requiring hours of manual effort to find relevant opportunities and craft tailored applications. JobWizard addresses this by automating the discovery of job offers and generating personalized cover letters using real-time company and user experience data. Access to reliable, current web data ensures accurate job matches and high-quality cover letters, significantly improving application success rates.



## Meeting the Bright Data Challenge Criteria

JobWizard leverages Bright Data’s MCP server to power a multi-agent system that automates job searches and cover letter generation, fulfilling three out of the four key criteria of the Bright Data Real-Time AI Agents Challenge: **Discover**, **Access** and **Extract**. By integrating reliable, real-time web data, JobWizard drastically reduces job search time and improves application success rates, addressing a critical real-world problem.

- **Discover: Find Relevant Content Across the Open Web**  
  JobWizard’s `agent-offers-finder` uses Bright Data’s `search_engine` tool to query job boards and platforms like LinkedIn, BuiltIn, and RemoteRocketship in real time. For example, a user seeking “Data engineering jobs in France” triggers precise searches (e.g., “Data engineering jobs in France Python SQL AWS”) to identify relevant job listings instantly. This ensures the system discovers up-to-date opportunities tailored to the user’s resume, enhancing AI performance by providing a broad, current dataset for matching.

- **Access: Navigate Complex or Protected Websites**  
  Accessing dynamic job boards and company websites is challenging due to rate limits and IP blocks. Bright Data’s MCP server simplifies this by enabling seamless navigation of complex, JavaScript-rendered pages. The `scrape_as_markdown` tool allows JobWizard to access job listings (e.g., Devoteam’s career page at `https://jobs.smartrecruiters.com/devoteam/744000042826005`) without disruptions, ensuring reliable data retrieval for downstream processing.

- **Extract: Pull Structured, Real-Time Data at Scale**  
  JobWizard extracts structured data from diverse sources using Bright Data’s `scrape_as_markdown` and `web_data_linkedin_company_profile` tools. The `agent-offer-enricher` pulls detailed job and company insights, such as role requirements and company culture from LinkedIn profiles and career pages. This structured data (e.g., job descriptions, salary ranges) is critical for generating accurate, personalized cover letters, improving AI performance by grounding outputs in high-quality, real-time information.


By integrating Bright Data’s MCP server tools with a custom TypeScript multi-agent framework, JobWizard overcomes the challenge of scraping reliable data without rate limits or IP blocks. This ensures real-time, accurate data flows into the AI pipeline, enabling precise job matching and compelling cover letters that boost application success rates.



## How It Works
JobWizard’s multi-agent system orchestrates a seamless workflow, powered by Bright Data’s MCP server and a custom TypeScript framework. Here’s how it transforms your job search:

1. **Upload Your Resume**: Upload a PDF resume, and our AI parser extracts skills, experience, and education into structured data using advanced vision LLMs.
2. **Discover Relevant Jobs**: JobWizard searches the web in real time for job offers tailored to your profile (e.g., “Data Engineer roles in France”). Bright Data’s MCP server enables discovery and access to platforms like LinkedIn, BuiltIn, and RemoteRocketship.
3. **Select Your Top Picks**: Review a curated list of job offers and choose roles that excite you, such as an “Azure Data Engineer” position at Devoteam.
4. **Enrich Job Insights**: For each selected job, JobWizard pulls detailed insights (e.g., company culture, salary ranges) from sources like company websites and LinkedIn profiles using Bright Data’s scraping tools.
5. **Get Tailored Cover Letters**: Receive personalized cover letters crafted to align your skills with each job’s requirements, ready to apply in minutes.



## Demo
Try JobWizard now at [https://brightdata-mcp.bitswired.com](https://brightdata-mcp.bitswired.com).  
**Testing Credentials**:  
- Email: `noah@brightdata.com`  
- Password: Provided by email to Noah to avoid abuse

Upload a resume or use the demo mode to see JobWizard find job offers (e.g., “Data engineering jobs in France”) and generate a cover letter.



## Technical Implementation
JobWizard is built with a modern, scalable tech stack, integrating Bright Data’s MCP server and a custom TypeScript multi-agent framework:

- **Bun Monorepo**: Houses API (`ElysiaJS`), frontend with Tanstack Router/Query), and a custom agent package, all in TypeScript.
- **Custom Multi-Agent Framework**: A TypeScript-based system enabling complex, hierarchical workflows. The `agent-router` dispatches tasks to specialized agents (`agent-offers-finder`, `agent-offer-enricher`, `agent-cover-letter-writer`) and tools, supporting arbitrary nesting for dynamic task orchestration.
- **Bright Data MCP Server**: Powers real-time web data tasks:
  - `search_engine`: Queries job boards (e.g., “Data engineering jobs in France Python SQL AWS”).
  - `scrape_as_markdown`: Extracts structured data from dynamic pages (e.g., Devoteam’s career page).
  - `web_data_linkedin_company_profile`: Enriches job offers with company insights from LinkedIn.
- **WebSocket**: Enables real-time interaction between users and agents, displaying progress (e.g., “Parsing resume…”) and user inputs (e.g., job selection) via UI elements triggered by WebSocket events.
- **Database**: SQLite for lightweight, efficient storage of job data and user profiles.
- **Deployment**: Docker Compose on Hetzner, proxied by Cloudflare for reliability and performance.

## Challenges Overcome
Scraping accurate data from websites like search engines, LinkedIn, and Glassdoor is challenging due to rate limits and IP blocks when using backend automated tools. Bright Data’s MCP server simplified this by providing robust scraping infrastructure, enabling seamless access to dynamic, JavaScript-rendered pages. Tools like `search_engine`, `scrape_as_markdown`, and `web_data_linkedin_company_profile` allowed JobWizard to reliably discover job listings, extract structured data, and enrich offers with company insights, ensuring high-quality, real-time results without disruptions.

## Why JobWizard Stands Out
- **Real-World Impact**: Saves hours of manual job searching and tailors applications to boost success rates, directly addressing a common pain point for job seekers.
- **Real-Time Data**: Leverages Bright Data’s MCP server for up-to-date job matches and enriched insights, improving AI performance with reliable web data.
- **Technical Innovation**: The custom TypeScript multi-agent framework enables complex, nested workflows, making JobWizard scalable and adaptable.
- **User Experience**: Real-time WebSocket updates and an intuitive UI ensure a seamless, human-in-the-loop interaction.

## Future Improvements
- Expand job source coverage
- Enhance cover letter customization with user feedback loops.
- Integrate more advanced LLMs for deeper personalization.
- Generate entirely customized resumes for each job offer

## Acknowledgments
JobWizard was built for the Bright Data Real-Time AI Agents Challenge, utilizing their excellent MCP server tools. Special thanks to the Bright Data team for providing $250 in credits and support via `noah@brightdata.com`.

## Contact
For questions or feedback, reach out at [jimi@bitswired.com](mailto:jimi@bitswired.com) or [X](https://x.com/bitswired) for updates.

---

**Built with ❤ for the Bright Data Challenge**
<br />
<br />
<br />
