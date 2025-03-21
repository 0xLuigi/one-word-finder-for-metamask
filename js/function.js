// Globálne premenné používané v aplikácii
let validSeedPhrasesData = ''; // Uchováva iba validné seed frázy pre stiahnutie
let validAddressesData = ''; // Uchováva iba ETH adresy pre stiahnutie
let isSearching = false; // Indikuje, či prebieha vyhľadávanie
let stopRequested = false; // Signál na zastavenie vyhľadávania
let startTime = null; // Čas začiatku vyhľadávania pre výpočet trvania

// Spustí sa po načítaní DOM, nastavuje event listenery a inicializáciu
document.addEventListener('DOMContentLoaded', function() {
    const coffeeIcon = document.getElementById('coffee-icon');
    const ethAddressModal = document.getElementById('eth-address-modal');
    const closeButton = document.querySelector('.close-button');
    const luigiIcon = document.getElementById('luigi-icon');

    // Otvorí modálne okno s ETH adresou po kliknutí na ikonu kávy
    coffeeIcon.addEventListener('click', function(event) {
        event.preventDefault();
        ethAddressModal.style.display = 'block';
    });

    // Zatvorí modálne okno po kliknutí na tlačidlo zatvorenia
    closeButton.addEventListener('click', function() {
        ethAddressModal.style.display = 'none';
    });

    // Zatvorí modálne okno po kliknutí mimo neho
    window.addEventListener('click', function(event) {
        if (event.target == ethAddressModal) {
            ethAddressModal.style.display = 'none';
        }
    });

    // Zoznam vtipných hlášok pre Luigiho ikonu
    const funnyMessages = [
        "This tool took Luigi 5 coffees and a midnight tiramisu break!",
        "Warning: Luigi’s MetaMask tool might hide a tiramisu recipe!",        
        "This app runs faster if you have parmesan cheese nearby.",
        "Want to buy Luigi a coffee? Click on the coffee icon!",
        "Luigi says: If it works, don’t touch it, bro!",
        "This app was born in Luigi’s kitchen during a pizza break!",
        "Warning: This tool runs on caffeine and Luigi’s bad jokes!",
        "Luigi debugged this tool while humming ‘O Sole Mio’ at 4 AM!",
        "Warning: Luigi’s code might contain traces of mozzarella!",
        "This app is powered by Luigi’s love for blockchain and pizza!"
    ];

    // Po kliknutí na Luigiho ikonu zobrazí náhodnú hlášku a prečíta ju
    luigiIcon.addEventListener('click', function() {
        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        showResult(randomMessage, 12000);
        speakResult(randomMessage);
    });

    // Pridá event listenery na kontrolu slov v inputoch
    const inputs = document.querySelectorAll('.word-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            checkWord(input, index + 1);
            updateCopyButtonState();
        });
    });

    // Klávesové skratky: Esc (zastavenie), Enter (hľadanie), Alt+A (všetky kombinácie)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isSearching) {
            event.preventDefault();
            stopSearch();
        }
        if (event.key === 'Enter' && !isSearching) {
            const isInputFocused = document.activeElement.tagName === 'INPUT';
            if (!isInputFocused) {
                event.preventDefault();
                startSearch();
            }
        }
        if (event.altKey && event.key === 'a' && !isSearching) {
            const isInputFocused = document.activeElement.tagName === 'INPUT';
            if (!isInputFocused) {
                event.preventDefault();
                generateAllCombinations();
            }
        }
    });
});

// Prečíta text pomocou SpeechSynthesis API
function speakResult(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.volume = 1.0;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// Rozdelí vložený text do jednotlivých slov a vyplní inputy (ak je 11 alebo 12 slov)
function distributeWords(input) {
    const text = input.value.trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 11 || words.length === 12) {
        const maxWords = Math.min(words.length, 12);
        for (let i = 0; i < maxWords; i++) {
            const wordInput = document.getElementById(`word${i + 1}`);
            wordInput.value = words[i];
            checkWord(wordInput, i + 1);
        }
    }
}

// Kontroluje, či je slovo platné (z BIP-39 zoznamu) a ponúka návrhy
function checkWord(input, index) {
    const word = input.value.trim().toLowerCase();
    const suggestionsDiv = document.getElementById('suggestions');
    const suggestionsLabel = document.getElementById('suggestionsLabel');
    const suggestionsWrapper = document.getElementById('suggestionsWrapper');
    
    input.classList.remove('invalid-word', 'valid-word');
    
    if (!word) {
        suggestionsDiv.style.display = 'none';
        suggestionsLabel.textContent = '';
        suggestionsWrapper.innerHTML = '';
        return;
    }

    const isValid = bip39Words.includes(word);
    
    if (word.length >= 2) {
        if (isValid) {
            input.classList.add('valid-word');
            suggestionsDiv.style.display = 'none';
            suggestionsLabel.textContent = '';
            suggestionsWrapper.innerHTML = '';
        } else {
            input.classList.add('invalid-word');
            const matchingWords = bip39Words.filter(w => w.startsWith(word));
            if (matchingWords.length > 0) {
                suggestionsDiv.style.display = 'block';
                suggestionsLabel.textContent = `Suggestions for word ${index}`;
                suggestionsWrapper.innerHTML = '';
                matchingWords.forEach((suggestion, idx) => {
                    const span = document.createElement('span');
                    span.textContent = suggestion;
                    span.className = 'suggestion';
                    span.setAttribute('data-tooltip', `Click to add "${suggestion}" to Word ${index}`);
                    span.addEventListener('mouseover', () => span.style.color = '#f27641');
                    span.addEventListener('mouseout', () => span.style.color = '#fff');
                    span.onclick = () => {
                        input.value = suggestion;
                        checkWord(input, index);
                        suggestionsDiv.style.display = 'none';
                    };
                    suggestionsWrapper.appendChild(span);
                    if (idx < matchingWords.length - 1) {
                        suggestionsWrapper.appendChild(document.createTextNode(', '));
                    }
                });
            } else {
                suggestionsDiv.style.display = 'block';
                suggestionsLabel.textContent = `No matching words found for "${word}"`;
                suggestionsWrapper.innerHTML = '';
            }
        }
    }
}

// Zapína/vypína tlačidlá a inputy počas vyhľadávania
function toggleButtons(disable) {
    const buttons = [
        document.getElementById('findButton'),
        document.getElementById('copyButton'),
        document.getElementById('allCombinationsButton')
    ];
    const inputs = document.querySelectorAll('.word-input, #ethAddressInput');
    buttons.forEach(button => button.disabled = disable);
    inputs.forEach(input => input.disabled = disable);
}

// Spustí vyhľadávanie chýbajúceho slova pre danú ETH adresu
async function startSearch() {
    document.getElementById('download-container').style.display = 'none';

    const ethAddress = document.getElementById('ethAddressInput').value.trim();
    if (!ethAddress) {
        showError('Please enter ETH address!');
        return;
    }
    if (ethAddress.length !== 42 || !ethAddress.startsWith('0x')) {
        showError('Enter a valid ETH address (must start with "0x" and have 42 characters)!');
        return;
    }

    const words = [];
    let nonEmptyWordCount = 0;
    let invalidWords = [];
    for (let i = 1; i <= 12; i++) {
        let word = document.getElementById(`word${i}`).value;
        word = word.trim().toLowerCase().replace(/\s+/g, ' ');
        document.getElementById(`word${i}`).value = word;
        if (word) {
            nonEmptyWordCount++;
            if (!bip39Words.includes(word)) {
                invalidWords.push(`Word ${i}: ${word}`);
                document.getElementById(`word${i}`).classList.add('invalid-word');
            }
        }
        words.push(word);
    }

    if (nonEmptyWordCount !== 11) {
        showError('You must fill in exactly 11 words of the seed phrase!');
        return;
    }
    if (invalidWords.length > 0) {
        showError(`Invalid words detected: ${invalidWords.join(', ')}`);
        return;
    }

    const resetButton = document.getElementById('resetButton');
    resetButton.textContent = 'Stop searching';
    resetButton.onclick = stopSearch;
    resetButton.classList.add('stop-state');
    resetButton.disabled = false;
    toggleButtons(true);
    isSearching = true;
    stopRequested = false;

    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const progressDiv = document.getElementById('progress');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const resultDiv = document.getElementById('result');

    statusDot.style.backgroundColor = 'green';
    statusDot.classList.add('blinking');
    progressDiv.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    resultDiv.textContent = '';

    let emptyIndex = words.findIndex(word => word === '');
    statusText.textContent = `Finding word ${emptyIndex + 1}`;

    let testedCount = 0;
    const totalTests = bip39Words.length;

    startTime = Date.now();

    const updateProgressText = () => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        progressText.innerHTML = `<span class="tested-count">Tested: ${testedCount} of ${totalTests} words</span> | <span class="elapsed-time">Elapsed: ${formattedTime}</span>`;
    };

    const timerInterval = setInterval(updateProgressText, 1000);

    for (let word of bip39Words) {
        if (stopRequested) {
            clearInterval(timerInterval);
            resetSearchState();
            statusText.textContent = 'Search stopped by user';
            return;
        }

        testedCount++;
        let progressPercent = ((testedCount / totalTests) * 100).toFixed(2);
        updateProgressText();
        progressBar.style.width = `${progressPercent}%`;
        progressBar.textContent = `${progressPercent}%`;

        const testWords = [...words];
        testWords[emptyIndex] = word;

        try {
            const mnemonic = testWords.join(' ');
            const wallet = ethers.Wallet.fromMnemonic(mnemonic);
            if (wallet.address.toLowerCase() === ethAddress.toLowerCase()) {
                document.getElementById(`word${emptyIndex + 1}`).value = word;
                const resultMessage = `Missing word is: ${word}`;
                const speakMessage = `Missing word is ${word}`;
                resultDiv.textContent = resultMessage;
                speakResult(speakMessage);
                clearInterval(timerInterval);
                resetSearchState();
                statusText.textContent = 'Completed!';
                updateCopyButtonState();
                return;
            }
        } catch (error) {
            console.error(error);
        }

        await new Promise(r => setTimeout(r, 5));
    }

    clearInterval(timerInterval);
    resetSearchState();
    statusText.textContent = 'Missing word not found.';
}

// Vymaže všetky inputy a resetuje súvisiace prvky vrátane globálnych dát
function resetFields() {
    if (!isSearching) {
        const inputs = document.querySelectorAll('.word-input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('invalid-word', 'valid-word');
        });
        document.getElementById('ethAddressInput').value = '';
        document.getElementById('suggestions').style.display = 'none';
        document.getElementById('suggestionsLabel').textContent = '';
        document.getElementById('suggestionsWrapper').innerHTML = '';
        document.getElementById('download-container').style.display = 'none';
        
        // Vymazanie citlivých dát z globálnych premenných kvôli bezpečnosti
        validSeedPhrasesData = '';
        validAddressesData = '';
        
        // Potvrdenie pre používateľa
        showResult('All data has been deleted from memory.', 3000);
    }
}

// Skopíruje všetkých 12 slov do schránky
function copyWords() {
    const words = [];
    let allFilled = true;
    
    for (let i = 1; i <= 12; i++) {
        const word = document.getElementById(`word${i}`).value.trim();
        if (word === '') {
            allFilled = false;
            break;
        }
        words.push(word);
    }
    
    if (!allFilled) {
        alert('Please fill in all 12 words before copying!');
        return;
    }
    
    const mnemonic = words.join(' ');
    navigator.clipboard.writeText(mnemonic)
        .then(() => {
            alert('12 words copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
}

// Aktualizuje stav tlačidla "Copy" na základe vyplnenia všetkých slov
function updateCopyButtonState() {
    const inputs = document.querySelectorAll('.word-input');
    let allFilled = true;
    inputs.forEach(input => {
        if (input.value.trim() === '') {
            allFilled = false;
        }
    });
    document.getElementById('copyButton').disabled = !allFilled || isSearching;
}

// Generuje všetky platné kombinácie seed fráz a zobrazí tlačidlá na stiahnutie
async function generateAllCombinations() {
    const ethAddress = document.getElementById('ethAddressInput').value.trim();
    if (ethAddress) {
        showError("Please clear the ETH address field to use this function!");
        return;
    }

    const words = Array.from(document.querySelectorAll('.word-input'))
        .map(input => input.value.trim())
        .filter(word => word !== '');

    if (words.length !== 11) {
        showError("Please enter exactly 11 words!");
        return;
    }

    const invalidWords = words.filter(word => !bip39Words.includes(word));
    if (invalidWords.length > 0) {
        showError(`Invalid words: ${invalidWords.join(', ')}`);
        return;
    }

    const resetButton = document.getElementById('resetButton');
    resetButton.textContent = 'Stop searching';
    resetButton.onclick = stopSearch;
    resetButton.classList.add('stop-state');
    resetButton.disabled = false;
    toggleButtons(true);
    isSearching = true;
    stopRequested = false;

    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const progressDiv = document.getElementById('progress');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const resultDiv = document.getElementById('result');
    const downloadContainer = document.getElementById('download-container');

    downloadContainer.style.display = 'none';
    statusDot.style.backgroundColor = 'green';
    statusDot.classList.add('blinking');
    progressDiv.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    resultDiv.textContent = '';

    const emptyIndex = Array.from(document.querySelectorAll('.word-input')).findIndex(input => input.value.trim() === '');
    statusText.textContent = `Testing combinations for word ${emptyIndex + 1}`;

    let testedCount = 0;
    const totalTests = bip39Words.length;
    const validCombinations = [];

    startTime = Date.now();

    const updateProgressText = () => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        progressText.innerHTML = `<span class="tested-count">Tested: ${testedCount} of ${totalTests} words</span> | <span class="elapsed-time">Elapsed: ${formattedTime}</span>`;
    };

    const timerInterval = setInterval(updateProgressText, 1000);

    for (let word of bip39Words) {
        if (stopRequested) {
            clearInterval(timerInterval);
            resetSearchState();
            statusText.textContent = 'Search stopped by user';
            return;
        }

        testedCount++;
        let progressPercent = ((testedCount / totalTests) * 100).toFixed(2);
        updateProgressText();
        progressBar.style.width = `${progressPercent}%`;
        progressBar.textContent = `${progressPercent}%`;

        const testWords = [...words];
        testWords.splice(emptyIndex, 0, word);

        try {
            const mnemonic = testWords.join(' ');
            const wallet = ethers.Wallet.fromMnemonic(mnemonic);
            validCombinations.push({
                mnemonic: mnemonic,
                address: wallet.address
            });
        } catch (error) {
            // Preskočí neplatné kombinácie
        }

        await new Promise(r => setTimeout(r, 5));
    }

    clearInterval(timerInterval);
    resetSearchState();

    if (validCombinations.length > 0) {
        statusText.textContent = `Found ${validCombinations.length} valid combinations!`;
        // Uloží iba seed frázy
        validSeedPhrasesData = validCombinations.map(combo => 
            `${combo.mnemonic}`
        ).join('\n');
        // Uloží iba adresy
        validAddressesData = validCombinations.map(combo => 
            `${combo.address}`
        ).join('\n');

        // Zobrazí download container a nastaví tlačidlá
        downloadContainer.style.display = 'block';
        downloadContainer.offsetHeight;
        downloadContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        document.getElementById('downloadButton').onclick = function() {
            downloadSeedPhrases();
        };
        document.getElementById('downloadAddressesButton').onclick = function() {
            downloadAddressesOnly();
        };
        const resultMessage = `Found ${validCombinations.length} valid seed phrases with their ETH addresses! Use the buttons below to download seed phrases or addresses.`;
        showResult(resultMessage);
        speakResult(`Found ${validCombinations.length} valid seed phrases`);
    } else {
        statusText.textContent = 'No valid combinations found.';
        showResult("No valid seed phrases were found with the given words.");
    }
}

// Stiahne súbor iba s validnými seed frázami
function downloadSeedPhrases() {
    if (!validSeedPhrasesData) {
        showError("No seed phrases to download. Please run the search first.");
        return;
    }
    
    const fileName = 'valid_seed_phrases.txt';
    const blob = new Blob([validSeedPhrasesData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
        showResult(`File '${fileName}' with valid seed phrases has been downloaded.`);
    }, 100);
}

// Stiahne súbor iba s ETH adresami
function downloadAddressesOnly() {
    if (!validAddressesData) {
        showError("No addresses to download. Please run the search first.");
        return;
    }
    
    const fileName = 'valid_eth_addresses.txt';
    const blob = new Blob([validAddressesData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
        showResult(`File '${fileName}' with valid ETH addresses has been downloaded.`);
    }, 100);
}

// Zastaví prebiehajúce vyhľadávanie
function stopSearch() {
    if (isSearching) {
        stopRequested = true;
    }
}

// Resetuje stav vyhľadávania po jeho skončení alebo prerušení
function resetSearchState() {
    const resetButton = document.getElementById('resetButton');
    resetButton.textContent = 'Delete all data';
    resetButton.onclick = resetFields;
    resetButton.classList.remove('stop-state');
    resetButton.disabled = false;
    toggleButtons(false);
    isSearching = false;
    stopRequested = false;
    document.getElementById('statusDot').classList.remove('blinking');
    document.getElementById('progress').style.display = 'none';
    document.getElementById('progressText').textContent = 'Tested: 0 of 0 words';
    updateCopyButtonState();
    startTime = null;

    // Vymazanie citlivých dát po skončení vyhľadávania
    validSeedPhrasesData = '';
    validAddressesData = '';
}

// Zobrazí chybovú správu na 3 sekundy
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        setTimeout(() => {
            errorDiv.textContent = '';
        }, 3000);
    } else {
        alert(message);
    }
}

// Zobrazí výsledok (s voliteľným časovačom na vymazanie)
function showResult(message, timeout = null) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.textContent = message;
        if (timeout) {
            setTimeout(() => { 
                resultDiv.textContent = '';
            }, timeout);
        }
    } else {
        alert(message);
    }
}