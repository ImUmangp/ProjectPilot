import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="relative isolate">
      {/* Hero section */}
      <div className="relative pt-5">
        <div className="relative pt-0">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Transform your ideas into structured projects
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Prompt, structure, and organize your project ideas with AI assistance.
              Get a clear roadmap for implementation in seconds.
            </p>
            <div className="mt-10">
              <div className="relative rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <Link
                  href="/submit"
                  className="block w-full rounded-lg p-4 text-left hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">What's your project idea?</span>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-6">
              <p className="text-sm text-gray-400">Popular actions</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/submit"
                  className="rounded-full bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Generate project structure
                </Link>
                <Link
                  href="/history"
                  className="rounded-full bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  View past ideas
                </Link>
                <Link
                  href="/auth"
                  className="rounded-full bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">Faster Development</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to structure your ideas
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our AI-powered tool helps you transform rough ideas into well-organized project plans with clear structure and implementation steps.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    name: 'AI-Powered Structure',
    description: 'Our AI analyzes your idea and creates a well-organized structure with all necessary sections.',
  },
  {
    name: 'Implementation Guide',
    description: 'Get detailed implementation steps, tech stack recommendations, and resource suggestions.',
  },
  {
    name: 'History & Management',
    description: 'Access your past ideas, edit them, and keep track of your project planning history.',
  },
]
