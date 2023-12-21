import { Link } from "react-router-dom";
import { useState } from "react";
import DeleteLogo from "./assets/DeleteLogo"

export default function ProjectCard({ project }) {
  const [visible, setVisible] = useState(true)
  const { project_id, project_name, picture, created_at } = project

  async function deleteProject() {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/delete/${project_id}`, {
      method: "DELETE"
    })
    if (res.ok) {
      const data = await res.json()
      if (data.ok) {
        setVisible(false)
      } else {
        console.log("[REQUEST SUCCESS] could not delete from backend")
      }
      console.log(data)
    } else {
      console.log("Unable to SEND delete request")
    }
  }

  function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()

    deleteProject()
  }

  return (
    visible && <Link
      to={`/app?id=${project_id}`}
      className="w-full border-2 border-neutral-300 rounded-md hover:border-blue-500 duration-0 flex flex-col group"
    >
      <div className="aspect-video border-b group overflow-hidden">
        {picture && <img src={picture} alt="" className="object-cover w-full h-full group-hover:scale-[120%] duration-200" />}
      </div>

      <div className="flex flex-col py-2 px-3 w-full">
        <p className="text-slate-800 font-medium whitespace-nowrap line-clamp-1 overflow-ellipsis">{project_name}</p>
        <div className="flex justify-between text-xs text-slate-500">
          <div className="whitespace-nowrap flex items-center line-clamp-1 overflow-ellipsis">Last Edited {created_at.split('T')[0]}</div>
          <button onClick={handleDelete} className="w-fit h-fit overflow-hidden p-1 rounded-full hover:bg-red-50 hover:text-red-600 active:scale-[85%] active:text-red-600 duration-200">
            <DeleteLogo className={`w-6 translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-100`} />
          </button>
        </div>
      </div>

    </Link>
  )
}
