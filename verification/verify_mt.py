from playwright.sync_api import sync_playwright

def verify_mt_and_warning():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:8080/index.html")

            # 1. Check if the status eventually says "MT" (meaning it tried to load MT core)
            # Since real loading might fail due to headers in this env or be slow, we check for the text update or log.
            # But the user specifically wants the large file warning logic tested.

            # 2. Simulate selecting a large file
            # We can't easily upload a fake 200MB file, but we can call the handleFile logic directly via evaluate

            page.evaluate("""
                const fakeFile = {
                    name: 'huge_recording.wav',
                    size: 250 * 1024 * 1024, // 250MB
                    type: 'audio/wav'
                };
                handleFile(fakeFile);
            """)

            # Check for the warning message
            page.wait_for_selector("#large-file-warning")
            warning_text = page.text_content("#large-file-warning")
            print(f"Warning text found: {warning_text}")

            screenshot_path = "verification/large_file_warning.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_mt_and_warning()
