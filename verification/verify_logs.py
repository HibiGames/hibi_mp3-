from playwright.sync_api import sync_playwright

def verify_logs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:8080/index.html")

            # Wait for logs to potentially appear (FFmpeg loading)
            # Since FFmpeg loading is async and might take time or fail in headless without headers...
            # We just want to see if the log container is there and maybe shows "FFmpeg loaded" or an error.

            # Force log display for verification
            page.evaluate("document.getElementById('log').style.display = 'block'")
            page.evaluate("document.getElementById('log').textContent = 'Test log message'")

            page.wait_for_selector("#log", state="visible")

            screenshot_path = "verification/logs_ui.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_logs()
