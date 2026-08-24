import { expect, test } from '@playwright/test'

test.describe('PolyGlot Live smoke', () => {
  test('renders the passport hub with three scenarios', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('passport-hub')).toBeVisible()
    await expect(page.getByText('PolyGlot Passport')).toBeVisible()
    await expect(page.getByTestId('scenario-tapas')).toBeVisible()
    await expect(page.getByTestId('scenario-bicycle')).toBeVisible()
    await expect(page.getByTestId('scenario-interview')).toBeVisible()
  })

  test('opens a briefing and starts the live HUD', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('scenario-tapas').click()
    await expect(page.getByTestId('scenario-briefing')).toBeVisible()
    await expect(page.getByText('Ordering Tapas at El Sol')).toBeVisible()
    await expect(page.getByText('Host at El Sol, Madrid')).toBeVisible()

    await page.getByTestId('start-conversation').click()
    await expect(page.getByTestId('live-hud')).toBeVisible()
    await expect(page.getByText('Mateo').first()).toBeVisible()
    await expect(page.getByText('Bienvenido a El Sol')).toBeVisible()
  })

  test('typed demo turn gets a canned host reply', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('scenario-tapas').click()
    await page.getByTestId('start-conversation').click()
    await expect(page.getByTestId('live-hud')).toBeVisible()

    await page.getByTestId('type-toggle').click()
    const box = page.getByTestId('typed-input')
    await expect(box).toBeVisible()
    await box.fill('Hola, unas patatas bravas por favor')
    await page.getByTestId('send-typed').click()

    await expect(page.getByText('unas patatas bravas y una copa de vino tinto', { exact: false })).toBeVisible({
      timeout: 10_000,
    })
  })

  test('desktop toggle shows the marketing landing', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('device-desktop').click()
    await expect(page.getByTestId('web-landing')).toBeVisible()
    await expect(page.getByText('Live AI Voice Roleplay')).toBeVisible()
    await expect(page.getByText('Grammar Toasts')).toBeVisible()
  })

  test('ending a call lands on the scorecard', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('scenario-tapas').click()
    await page.getByTestId('start-conversation').click()
    await expect(page.getByTestId('live-hud')).toBeVisible()
    await page.getByTestId('end-call').click()
    await expect(page.getByTestId('scorecard')).toBeVisible()
    await expect(page.getByText('Session Summary')).toBeVisible()
    await expect(page.getByTestId('fluency-score')).toBeVisible()
  })
})
