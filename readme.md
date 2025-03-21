# One Word Finder for MetaMask

![One Word Finder Screenshot](images/screenshot.jpg)

## Description

One Word Finder for MetaMask is a tool that helps complete MetaMask wallet seed phrases. If you know 11 out of 12 words of your seed phrase, this tool can help you find the missing word. With your ETH address, it will identify the exact missing word; without an address, it will generate all valid seed phrase combinations, giving you options to identify your wallet.

## Features

- **Find missing seed phrase word** based on a known ETH address
- **Generate all valid seed phrase combinations** (without requiring an ETH address)
- **Real-time validation** of entered words with immediate feedback
- **Automatic word suggestions** after typing at least 2 characters
- **Copy complete seed phrase** with a single click
- **Clear visualization** of search progress
- **Export valid seed phrases** with their ETH addresses to a text file
- **Highlights invalid words** with a red border in real-time for immediate error correction

## How to Use

### Finding One Missing Word
1. Enter the ETH address of your wallet
2. Fill in the 11 known words (leave one field empty to represent the missing word)
3. Click "Find missing word"

### Generating All Valid Combinations
1. Leave the ETH address field empty
2. Fill in the 11 known words
3. Click "All valid seed phrases"

## Keyboard Shortcuts

- **Enter**: Starts the search for the missing word
- **Esc**: Stops an ongoing search
- **Alt+A**: Generates all valid seed phrase combinations

## Security

- This tool operates **entirely on the client side** (in your browser)
- All data stays on your device and is **never transmitted** elsewhere
- It never sends your seed phrases or ETH addresses to any server
- For maximum security, we recommend using the tool in **offline mode** (e.g., disconnect from the internet or enable airplane mode)
- For even greater security, consider creating a **live Ubuntu USB** to run the tool in a secure, isolated environment

## Technical Information

- Uses the **ethers.js library** to handle Ethereum wallet operations
- Supports standard **BIP-39 seed phrases** (12 words) via the bip39words.js wordlist
- Leverages the **Web Speech API** (SpeechSynthesis) for text-to-speech functionality
- Built as a **pure client-side application** with no server-side dependencies
- Compatible with modern browsers (Chrome, Firefox, Edge, Safari)

## Performance Tips

To speed up the process:

- Use a modern browser and a powerful computer
- Close other resource-intensive applications and browser tabs
- Keep the tool in the foreground during the search
- Disable browser extensions that might interfere with JavaScript execution
- Avoid running the search in the background or on a minimized tab

## Test Data

For testing purposes:

- **Seed Phrase (SP)**: until above camera ugly sleep scan frown fiction above seed scout antenna
- **Ethereum Address (ETH)**: 0xeEfe9b081774197e844EFe5BaCC70240F15Bcfb0
