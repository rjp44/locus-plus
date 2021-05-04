import {
  act,
  render,
  screen
} from '@testing-library/react';
import App from './App';
import Location from "./lib/location";

jest.mock('./lib/location');

const testLocation = {
  phoneticCode: 'ALPHA BRAVO plus two',
  phoneticCodes: ['', 'CHARLIE DELTA ALPHA BRAVO plus two'],
  plusCode: 'ECHO CHARLIE DELTA ALPHA BRAVO plus two'
}

const failLocation = {
  err: 'Something went wrong, please enable location services'
}

beforeEach(() => {
  Location.mockClear();
  // Promise doesn't ever fire
  Location.mockImplementation(() => ({
    position: new Promise(() => null)
  }));
});



test('renders initial empty location', () => {
  render( <App/> );
  const locationElement = screen.getByText(/Dont know yet, please allow location access/i);
  expect(locationElement).toBeInTheDocument();
});


test('renders when location resolves', async () => {

  Location.mockImplementation(() => ({
    position: Promise.resolve(testLocation)
  }));

  await act(async () => {
    render(<App />);
  });
  expect(screen.getByText(testLocation.phoneticCode)).toBeInTheDocument();
});


test('renders error when location rejects', async () => {
  Location.mockImplementation(() => ({
    position: Promise.reject(failLocation)
  }));
  await act(async () => {
    render( <App/> );
  });
  expect(screen.getByText(failLocation.err)).toBeInTheDocument();
})
