const { chromium } = require('playwright');

const executePlan = async (plan) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  try {
    for (const step of plan.steps) {
      console.log(`Executing step: ${JSON.stringify(step)}`);

      switch (step.action) {
        case "open_website":
          const targetUrl = step.target.startsWith('http') ? step.target : `https://${step.target}`;
          await page.goto(targetUrl, { waitUntil: "networkidle" });
          console.log(`Opened website: ${targetUrl}`);
          break;

        case "fill_form":
          for (const [field, value] of Object.entries(step.fields)) {
            // Tìm selector cho trường nhập liệu
            let selector = await findFieldSelector(page, field);
            if (selector) {
              await page.fill(selector, value);
              console.log(`Filled form field: ${field} with value: ${value}`);
            } else {
              console.error(`No field found for: ${field}`);
            }
          }
          break;

        case "submit_form":
          const submitButtonSelector = 'button[type="submit"], input[type="submit"], .submit-btn';
          try {
            await page.waitForSelector(submitButtonSelector, { timeout: 10000 });
            await page.click(submitButtonSelector);
            await page.waitForNavigation({ waitUntil: "networkidle" });
            console.log("Form submitted");
          } catch (error) {
            console.error("Submit button not found or not clickable. Attempting fallback...");
            const fallbackSelector = 'button, input[type="button"], .btn';
            const fallbackButtons = await page.$$(fallbackSelector);
            if (fallbackButtons.length > 0) {
              await fallbackButtons[0].click();
              await page.waitForNavigation({ waitUntil: "networkidle" });
              console.log("Form submitted using fallback button");
            } else {
              console.error("No fallback button found. Form submission failed.");
            }
          }
          break;

        case "extract_result":
          const extractedData = {};
          for (const field of step.fields) {
            const data = await page.evaluate(
              (selector) => document.querySelector(selector)?.innerText || null,
              `.${field}`
            );
            extractedData[field] = data;
          }
          results.push(extractedData);
          console.log(`Extracted result: ${JSON.stringify(extractedData)}`);
          break;

        default:
          console.log(`Unknown action: ${step.action}`);
      }
    }
  } catch (error) {
    console.error(`Error executing plan: ${error.message}`);
  } finally {
    await browser.close();
  }

  return results;
};

// Hàm tìm kiếm selector dựa trên tên trường nhập liệu
const findFieldSelector = async (page, field) => {
  // Duyệt qua các selector thông dụng: name, id, placeholder, aria-label, label
  const possibleSelectors = [
    `input[name*="${field}"]`,
    `input[id*="${field}"]`,
    `input[placeholder*="${field}"]`,
    `input[aria-label*="${field}"]`,
    `label[for*="${field}"]`, // Thử tìm label gắn với input
    `input[role*="${field}"]`, // Dùng role nếu có
    `input[data-*="${field}"]`, // Kiểm tra các thuộc tính data
    `input[type*="${field}"]`  // Kiểm tra type nếu có
  ];

  // Duyệt qua các selector có thể tìm thấy trường nhập liệu
  for (let selector of possibleSelectors) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      return selector;
    }
  }

  // Nếu không tìm thấy, thử tìm các trường dạng Select, radio hoặc checkbox
  const possibleSelectorsSelect = [
    `select[name*="${field}"]`,
    `select[id*="${field}"]`,
    `select[aria-label*="${field}"]`
  ];

  for (let selector of possibleSelectorsSelect) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      return selector;
    }
  }

  // Nếu không tìm thấy, có thể thử kiểm tra các trường có kiểu input đặc biệt như radio, checkbox
  const possibleRadioSelectors = [
    `input[type="radio"][name*="${field}"]`,
    `input[type="checkbox"][name*="${field}"]`
  ];

  for (let selector of possibleRadioSelectors) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      return selector;
    }
  }

  // Nếu không tìm thấy, thử tìm các trường nhập liệu kiểu date
  const possibleSelectorsDate = [
    `input[type="date"][name*="${field}"]`,
    `input[type="date"][id*="${field}"]`,
    `input[type="date"][aria-label*="${field}"]`,
    `input[placeholder*="${field}"]`
  ];

  for (let selector of possibleSelectorsDate) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      return selector;
    }
  }

  // Trả về null nếu không tìm thấy
  return null;
};

module.exports = { executePlan };
