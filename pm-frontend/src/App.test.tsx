import { screen, waitFor } from "@testing-library/react"
import App from "./App"
import { renderWithProviders } from "./utils/test-utils"


test("renders App component successfully", async () => {
  renderWithProviders(<App />)

  const element = screen.getByText(/Hello World/i)
  await waitFor(() => {
    expect(element).toBeInTheDocument()
  })
})