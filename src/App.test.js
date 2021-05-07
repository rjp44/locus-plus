import {
  act,
  render,
  fireEvent,
  screen
} from '@testing-library/react';
import App from './App';


// Need this to mock the returned location and extend test coverage to location lib
Object.defineProperty(global.navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn()
  }
});

const locations = [
  [50.2, -5, ["six two two two plus two two two, Philleigh, England", "six two two two plus two two two, Lamorran, England", "six two two two plus two two two, Treworlas, England"]],
  // We have no place name data for NI
  [54.818105429866606, -7.028511272251086, ["nine CHARLIE six JULIET ROMEO XRAY nine CHARLIE plus six HOTEL XRAY", "nine CHARLIE six JULIET ROMEO XRAY nine CHARLIE plus six HOTEL XRAY", "nine CHARLIE six JULIET ROMEO XRAY nine CHARLIE plus six HOTEL XRAY"]],
  [51.52573553231748, -0.08370366791166943, ["GOLF eight plus seven GOLF VICTOR, City of London, England", "GOLF WHISKEY GOLF eight plus seven GOLF VICTOR, Bethnal Green, England", "GOLF WHISKEY GOLF eight plus seven GOLF VICTOR, Hackney, England"]],
  [55.57626681325015, -5.145275200193704, ["GOLF three plus GOLF VICTOR five, Brodick, Scotland", "GOLF three plus GOLF VICTOR five, Strathwhillan, Scotland", "HOTEL VICTOR GOLF three plus GOLF VICTOR five, North Corriegills, Scotland"]]
];


const failLocation = {
  err: 'Something went wrong, please enable location services'
};

test('renders initial empty location', () => {

  render(<App />);
  const locationElement = screen.getByTestId('phonetic');
  expect(locationElement).toBeEmptyDOMElement();
});


test('renders when location resolves', async () => {
  for (let location of locations) {
    let unmount;
    let [latitude, longitude, results] = location;
    global.navigator.geolocation.getCurrentPosition.mockImplementation((cb, errcb) => cb({ coords: { latitude, longitude } }));
    await act(async () => {
      ({ unmount } = render(< App />));
      fireEvent.click(screen.getByText('Get Location'));
    });
    await expect(screen.getByText(results[0])).toBeInTheDocument();
    await expect(screen.getByText('Try Another Spelling')).toBeInTheDocument();
    for (let result of results) {
      expect(screen.getByText(result)).toBeInTheDocument();
      act(() => {
        fireEvent.click(screen.getByText('Try Another Spelling'));
      });
    };
    unmount();
  }

});


test('renders error when location rejects', async () => {
  global.navigator.geolocation.getCurrentPosition.mockImplementation((cb, errcb) => errcb(failLocation.err));
  await act(async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Get Location'));
  });
  expect(screen.getByText(failLocation.err)).toBeInTheDocument();
});


