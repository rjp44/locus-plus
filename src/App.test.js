import {
  act,
  render,
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
  [50.2, -5, "six two two two plus two two two, Treworlas, England"],
  // We have no place name data for NI
  [54.818105429866606, -7.028511272251086, "nine CHARLIE six JULIET ROMEO XRAY nine CHARLIE plus six HOTEL XRAY"],
  [51.52573553231748, -0.08370366791166943, "GOLF eight plus seven GOLF VICTOR, City of London, England"],
  [55.57626681325015, -5.145275200193704, "GOLF three plus GOLF VICTOR five, Brodick, Scotland"]
];


const failLocation = {
  err: 'Something went wrong, please enable location services'
};

test('renders initial empty location', () => {


  render( <App/> );
  const locationElement = screen.getByText(/Dont know yet, please allow location access/i);
  expect(locationElement).toBeInTheDocument();
});


test('renders when location resolves', async () => {
  for (let location of locations) {
    let unmount;
    let [latitude, longitude, result] = location;
    global.navigator.geolocation.getCurrentPosition.mockImplementation((cb, errcb) => cb({ coords: { latitude, longitude } }));
    await act(async () => {
      ({ unmount } = render(< App />));
    });
    expect(screen.getByText(result)).toBeInTheDocument();
    unmount();
 
  }

});


test('renders error when location rejects', async () => {
  global.navigator.geolocation.getCurrentPosition.mockImplementation((cb, errcb) => errcb(failLocation.err))
  await act(async () => {
    render( <App/> );
  });
  expect(screen.getByText(failLocation.err)).toBeInTheDocument();
})


