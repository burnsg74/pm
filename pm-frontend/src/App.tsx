import { useEffect, useState } from "react"
const App = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("https://pm.localhost/api/")
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          const result = await response.text()
          setData(result)
        } catch (err: any) {
          setError(err.message)
        }
      }

      fetchData().then()
    }, [])

    return (
      <div className="App">
        <h1>Hello World</h1>
        API RESULT: {error ? (
          <p>Error: {error}</p>
        ) : data ? (
          <pre>{data}</pre>
          ) : (
          <p>Loading...</p>
          )}
      </div>
    )
}

export default App
