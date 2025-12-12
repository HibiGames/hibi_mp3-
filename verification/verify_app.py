from playwright.sync_api import sync_playwright

def verify_audio_compressor():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the local server
            page.goto("http://localhost:8080/index.html")

            # Wait for the page to load
            page.wait_for_selector("h1")

            # Check if title is correct
            title = page.title()
            print(f"Page title: {title}")

            # Check for key elements
            if page.is_visible("#upload-area") and page.is_visible("#compression-level") and page.is_visible("#convert-btn"):
                print("UI elements are visible.")
            else:
                print("UI elements are missing.")

            # Take a screenshot
            screenshot_path = "verification/audio_compressor.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_audio_compressor()
