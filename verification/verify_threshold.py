from playwright.sync_api import sync_playwright

def verify_larger_warning():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:8080/index.html")

            # Simulate selecting a 300MB file (Should NOT warn now, threshold is 400)
            page.evaluate("""
                const fakeFile = {
                    name: 'medium_recording.wav',
                    size: 300 * 1024 * 1024,
                    type: 'audio/wav'
                };
                handleFile(fakeFile);
            """)

            # Check that warning is NOT present
            is_visible = page.is_visible("#large-file-warning")
            print(f"Warning visible for 300MB file? {is_visible}")
            if is_visible:
                print("FAILURE: Warning should not be visible for 300MB file.")

            # Simulate selecting a 500MB file (Should warn)
            page.evaluate("""
                const fakeFile = {
                    name: 'huge_recording.wav',
                    size: 500 * 1024 * 1024,
                    type: 'audio/wav'
                };
                handleFile(fakeFile);
            """)

            # Check for the warning message
            page.wait_for_selector("#large-file-warning")
            warning_text = page.text_content("#large-file-warning")
            print(f"Warning text found for 500MB: {warning_text}")

            screenshot_path = "verification/threshold_update.png"
            page.screenshot(path=screenshot_path)

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_larger_warning()
