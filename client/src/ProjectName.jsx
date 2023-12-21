import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

export default function ProjectName({ id }) {
  const [name, setName] = useState('')
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    fetch(`${import.meta.env.VITE_BACKEND_URL}/get-name/${id}`, { signal })
      .then(res => res.json())
      .then(data => {
        setName(data.project_name)
      })
      .catch(err => console.log('[err get name]', err.message))

    return () => {
      controller.abort()
    }
  }, [])

  function handleBlur(e) {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/update-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        project_id: params.get("id"),
        project_name: e.target.value
      })
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.log("[Error update name]", err.message))
  }

  return (
    <input defaultValue={name} onBlur={handleBlur} className={`absolute  py-2 px-3 bg-black text-white  h-fit shadow-md flex items-center rounded-lg font-bold  w-full sm:w-fit duration-[200ms] top-7 left-7 "scale-150 left-20"`}>
    </input>
  )
}