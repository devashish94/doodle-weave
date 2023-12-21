import { useSearchParams } from "react-router-dom"
import DownloadLogo from "./assets/DownloadLogo"

export default function DownloadPicture() {
  const [params, _] = useSearchParams()

  function handleDownloadPicture() {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/download/${params.get("id")}`)
      .then(res => {
        if (!res.ok) {
          console.log("Image could not be got from backend")
          return
        }
        return res.blob()
      })
      .then(value => {
        const link = document.createElement('a')
        const blobURL = window.URL.createObjectURL(value)

        link.href = blobURL
        link.download = `image-${params.get("id")}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobURL)
      })
      .catch(err => console.log(err))
  }

  return (
    <button onClick={handleDownloadPicture} className="flex gap-2 fixed bottom-7 right-7 bg-black text-white hover:bg-violet-300 hover:text-black active:bg-violet-400 active:scale-90 duration-200 p-2 rounded-lg shadow-md">
      <DownloadLogo className={`w-8`} />
    </button>
  )
}