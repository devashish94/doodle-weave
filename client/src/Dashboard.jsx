import { useEffect, useState } from 'react'
import ProjectCard from './ProjectCard'
import palette from './assets/palette.png'
import PlusLogo from './assets/PlusLogo'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function DashBoard() {
  const [projects, setProjects] = useState(null)
  const [params, _] = useSearchParams()

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    async function getProjects() {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/${params.get("user_id")}`, { signal })
      setProjects(await res.json())
    }

    getProjects()

    return () => {
      controller.abort()
    }
  }, [])

  async function sendDbCreateNewProject(callbackFunction) {
    console.log(params.get("user_id"))
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/new-project/${params.get("user_id")}`)
    const data = await res.json()
    console.log(data)
    callbackFunction(data.insertId)
  }

  const navigate = useNavigate()

  function handleNewProject() {
    sendDbCreateNewProject(function (id) {
      console.log("redirect", id)
      navigate(`/app?id=${id}`)
    })
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-auto">
      <div className="w-full flex items-center py-3 px-4 gap-2 sticky top-0 sm:static bg-white border-b sm:border-none shadow sm:shadow-none">
        <div className="w-fit h-fit">
          <img src={palette} alt="" className="w-9" />
        </div>
        <p className="font-bold text-lg">Idea Palette</p>
      </div>
      <div className="w-full flex-1 px-4 pt-4 pb-32 sm:py-10 sm:px-32 xl:px-64  duration-300">
        <div className="gap-5 grid grid-cols-[repeat(auto-fill,minmax(100%,1fr))] mobile:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {projects && projects.length > 0 && projects.map((project) => {
            return <ProjectCard key={project.project_id} project={project} />
          })}
        </div>
      </div>

      <div onClick={handleNewProject} className="absolute bottom-8 right-8 shadow-xl rounded-full bg-white border">
        <button className="p-2 w-fit h-fit duration-[250ms] hover:rotate-180">
          <PlusLogo className={`w-10 text-black`} />
        </button>
      </div>
    </div>
  )
}
