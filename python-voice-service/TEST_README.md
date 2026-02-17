# Voice Assistant Service - Test Cases

This directory contains comprehensive test cases for the HomeGenie Voice Assistant Service.

## Test Structure

The test suite includes:

1. **Unit Tests** - Testing individual functions in isolation:
   - `simple_intent_detection()` - Intent detection logic
   - `convert_audio_to_wav()` - Audio format conversion
   - `process_with_gemini()` - Gemini AI processing
   - `process_with_huggingface()` - Hugging Face AI processing

2. **Integration Tests** - Testing API endpoints:
   - `/api/speech-to-text` - Speech recognition endpoint
   - `/api/text-to-speech` - Text-to-speech conversion endpoint
   - `/api/recognize-intent` - Intent recognition endpoint
   - `/health` - Health check endpoint
   - `/ai-info` - AI provider information endpoint
   - `/` - Root endpoint

## Test Coverage

### Intent Detection Tests
- Emergency keyword detection
- Status query detection
- List requests detection
- Category detection (Plumbing, Electrical, HVAC, Appliance)
- General inquiry handling

### Audio Processing Tests
- Audio format conversion (WebM, MP3 to WAV)
- Empty file handling
- Invalid audio format handling
- Speech recognition success/failure scenarios

### AI Processing Tests
- Gemini API integration
- Hugging Face API integration
- Fallback to rule-based detection
- Error handling for API failures

### API Endpoint Tests
- Request validation
- Response format validation
- Error handling
- Authentication (if applicable)

## Running Tests

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run All Tests

```bash
pytest
```

### Run with Verbose Output

```bash
pytest -v
```

### Run Specific Test Class

```bash
pytest test_main.py::TestSimpleIntentDetection
```

### Run Specific Test

```bash
pytest test_main.py::TestSimpleIntentDetection::test_detect_emergency_intent
```

### Run with Coverage

```bash
pytest --cov=main --cov-report=html
```

## Test Configuration

The `pytest.ini` file contains test configuration:
- Test discovery patterns
- Output verbosity
- Markers for categorizing tests (unit, integration, slow)

## Notes

- Most tests use mocking to avoid actual API calls to external services (Google Speech Recognition, Gemini, Hugging Face)
- Audio file tests use mock data to avoid requiring actual audio files
- Some tests may require environment variables to be set (though they're mocked in most cases)
- Tests are designed to run quickly without external dependencies

## Adding New Tests

When adding new tests:
1. Follow the naming convention: `test_<functionality>`
2. Use descriptive test names
3. Mock external dependencies
4. Test both success and failure scenarios
5. Add appropriate markers (@pytest.mark.unit, @pytest.mark.integration)

