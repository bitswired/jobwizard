import { Button } from "@app/components/ui/button";
import { $api } from "@app/lib/data";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Plus } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import imgFull from "../../public/full.jpeg";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function MotionContainer({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 1, delay: Math.random() }}
			viewport={{ once: true }}
			className="w-full"
		>
			{children}
		</motion.div>
	);
}

function Hero() {
	return (
		<section className="max-w-[1000px] text-center mx-auto space-y-6 flex gap-2 items-center justify-center max-[850px]:flex-col">
			<div className="space-y-6 w-1/2 max-[850px]:w-full">
				<div className="min-[850px]:text-left font-bold text-[2rem]">
					Leave it to JobWizard
				</div>
				<div className="min-[850px]:text-left text-[1rem] opacity-60">
					JobWizard is your AI-powered career ally, transforming resumes into
					opportunities. It scours the web for perfect job matches, enriches
					them with deep insights, and crafts tailored cover letters, all in
					real time. Focus on your future, JobWizard handles the rest.
				</div>
			</div>
			<div className="max-w-[400px]">
				<video
					src="https://pub-2841a52b911a4219930a8f0eeb5a5550.r2.dev/mobile-demo.mp4"
					autoPlay
					loop
					muted
					playsInline
				/>
			</div>
		</section>
	);
}

function HowStep({
	title,
	content,
	subtext,
}: {
	title: string;
	content: string;
	subtext: string;
}) {
	return (
		<div className="p-6 rounded-md shadow-md bg-slate-100 space-y-2 text-left">
			<div className="w-max font-semibold text-[1rem]">{title}</div>
			<div className="text-[0.9rem]">{content}</div>
			<Collapsible>
				<CollapsibleTrigger className="cursor-pointer text-base flex gap-2 items-center">
					<ChevronDown size={18} /> Techincal Note
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="text-left text-[0.75rem]">{subtext}</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

function ArrowDown({ thickness = 2, height = 24 }) {
	const scale = height / 24;
	const adjustedThickness = thickness / scale;

	return (
		<svg
			width={height}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 5V19M12 19L8 15M12 19L16 15"
				stroke="currentColor"
				strokeWidth={adjustedThickness}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function How() {
	return (
		<section className="max-w-[700px] text-center mx-auto space-y-6">
			<div className="font-bold text-[2rem]">How it works?</div>
			<div className="text-lg opacity flex flex-col gap-2 items-center">
				<HowStep
					title="1. Upload Your Resume"
					content="Kickstart your job search by uploading your resume in PDF format. Our AI-powered resume parser instantly extracts key details like skills, experience, and education, turning your resume into structured data ready for job matching."
					subtext="The resume-parser agent uses vision LLLMs to get structured data from PDF resumes, ensuring high-quality personalization."
				/>

				<ArrowDown height={50} thickness={3} />

				<HowStep
					title="2. Discover Relevant Jobs"
					content="JobWizard searches the web in real time to find job offers tailored to your skills and preferences, such as 'Data Engineer roles in France.' Powered by Bright Data’s MCP server, we scour platforms like LinkedIn, BuiltIn, and RemoteRocketship for the latest opportunities."
					subtext="The agent-offers-finder leverages Bright Data’s MCP server to discover and access job listings, using search queries like 'Data engineering jobs in France Python SQL AWS' to ensure relevance."
				/>

				<ArrowDown height={50} thickness={3} />

				<HowStep
					title="3. Select Your Top Picks"
					content="Review a curated list of job offers matched to your resume. Choose the roles that excite you, like an 'Azure Data Engineer' position at Devoteam, and let JobWizard take it from there."
					subtext="The user-interaction-select agent presents a curated list of job offers, allowing users to pick relevant roles via an intuitive interface, ensuring personalized outcomes."
				/>

				<ArrowDown height={50} thickness={3} />

				<HowStep
					title="4. Enrich Job Insights"
					content="For each selected job, JobWizard digs deeper to provide critical insights, such as company culture, salary ranges, and role-specific requirements. We pull real-time data from company websites, LinkedIn profiles, and job boards to give you a complete picture."
					subtext="The agent-offer-enricher uses Bright Data’s MCP server to extract and interact with dynamic web data, scraping sources like Devoteam’s career page and LinkedIn company profile for enriched job details."
				/>

				<ArrowDown height={50} thickness={3} />

				<HowStep
					title="5. Get Tailored Cover Letters"
					content="Receive personalized cover letters crafted for each job you select. JobWizard aligns your skills and experience with the job’s requirements, creating compelling letters that help you stand out, ready to apply in minutes."
					subtext="The agent-cover-letter-writer uses enriched job data and resume details to generate customized cover letters via advanced LLMs, ensuring alignment with roles like Azure Data Engineer at Devoteam."
				/>
			</div>
		</section>
	);
}

function A() {
	return (
		<div className="p-4 rounded-md shadow-lg w-max max-w-full mx-auto space-y-8">
			<div className="flex gap-2 mx-auto w-max items-center">
				<div className="max-w-[200px] aspect-square w-[25vw] rounded-full">
					<img
						alt="logo"
						src="https://media.licdn.com/dms/image/v2/D4E03AQF_m0BDuvX1hw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1663672185981?e=1753315200&v=beta&t=3dpOTzzdKHwLQSuD2BmCzj0f24coUnNPpXrcrKtRbuY"
						className="w-full h-full object-cover rounded-full"
					/>
				</div>
				<Plus size={64} />
				<div className="max-w-[200px] aspect-square w-[25vw] rounded-full">
					<img
						alt="logo"
						src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUUPboVpCJM3AaitI__Zo2pYYkFc1sGPOPqQ&s"
						className="w-full h-full object-cover rounded-full"
					/>
				</div>
			</div>
			<div className="text-center max-w-[700px] mx-auto mt-6 text-[1rem] opacity-80 space-y-4">
				<p>
					JobWizard is proudly built for the{" "}
					<a
						href="https://dev.to/devteam/join-the-bright-data-real-time-ai-agents-challenge-3000-in-prizes-cog"
						target="_blank"
						className="text-blue-600 hover:underline"
						rel="noreferrer"
					>
						Bright Data Real-Time AI Agents Challenge
					</a>
					. Powered by Bright Data’s MCP server, tools like{" "}
					<code className="font-bold">search_engine</code> and{" "}
					<code className="font-bold">scrape_as_markdown</code> enable real-time
					web data discovery, access, and extraction from platforms like
					LinkedIn and job boards.
				</p>
				<p>
					{" "}
					Combined with a custom TypeScript multi-agent framework I built for
					the occasion, JobWizard orchestrates complex hierarchical workflows,
					seamlessly blending AI agents and tools to deliver tailored job
					matches and cover letters with unmatched precision.
				</p>
			</div>
		</div>
	);
}

function HomePage() {
	const me = $api.useQuery("get", "/auth/me");

	const logout = $api.useMutation("post", "/auth/logout", {
		onSuccess: () => {
			window.location.reload();
		},
	});

	return (
		<>
			<div className="h-[60px] top-0 left-0 w-full flex justify-between items-center p-4 bg-white text-[0.8rem] gap-4">
				<div className="flex gap-4 items-center">
					<div className="size-[30px]">
						<img
							src="https://cdn-icons-png.flaticon.com/512/9631/9631363.png"
							alt="Logo"
							className="w-full h-full"
						/>
					</div>
					<div className="font-bold">JobWizard</div>
				</div>

				<div className="flex gap-2 ml-auto mr-4">
					<Link to="/app/readme">readme</Link>
				</div>

				{!me.data?.email && (
					<div className="flex gap-2">
						<Button size="sm">
							<Link to="/login">Login</Link>
						</Button>
					</div>
				)}

				{me.data?.email && (
					<>
						<Button size="sm" className="text-[0.8rem]">
							<Link to="/app/seek">Start</Link>
						</Button>
						<Button
							className=""
							variant="outline"
							size="sm"
							onClick={() => logout.mutate({})}
						>
							Logout
						</Button>
					</>
				)}
			</div>
			<div className="w-full min-h-screen mt-16 p-8 pt-0 space-y-32">
				<MotionContainer>
					<Hero />
				</MotionContainer>

				<MotionContainer>
					<div className="hidden">
						<h1 className="text-center text-4xl font-bold hidden">
							Your AI Job Seeker
						</h1>
						<div className="w-full max-w-[1000px] aspect-video mx-auto rounded-md relative">
							<img
								src={imgFull}
								alt="Logo"
								className="h-full w-full rounded-md shadow-xl object-cover"
							/>
						</div>
					</div>
				</MotionContainer>
				<MotionContainer>
					<A />
				</MotionContainer>
				<MotionContainer>
					<How />
				</MotionContainer>
			</div>
		</>
	);
}
