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
  [
    50.2, -5,
    [
      'Six Two Two Two Plus Two Two Two, Philleigh, England',
      'Six Two Two Two Plus Two Two Two, Lamorran, England',
      'Six Two Two Two Plus Two Two Two, Treworlas, England'
    ],
    'SW 85999 37639'
  ],
  [ // We don't have location references for NI (yet) so no shortcode
    54.818105429866606, -7.028511272251086,
    [
      'Nine Charlie Six Juliet Romeo Xray Nine Charlie Plus Six Hotel Xray',
      'Nine Charlie Six Juliet Romeo Xray Nine Charlie Plus Six Hotel Xray',
      'Nine Charlie Six Juliet Romeo Xray Nine Charlie Plus Six Hotel Xray'
    ], 
    'NV 77107 58626'
  ],
  [
    51.52573553231748, -0.08370366791166943,
    [
      'Golf Eight Plus Seven Golf Victor, City of London, England',
      'Golf Whiskey Golf Eight Plus Seven Golf Victor, Southwark, England',
      'Golf Whiskey Golf Eight Plus Seven Golf Victor, Bethnal Green, England',
      'Golf Whiskey Golf Eight Plus Seven Golf Victor, Hackney, England'
    ],
    'TQ 33035 82498'
  ],
  [
    55.57626681325015, -5.145275200193704,
    [
      'Golf Three Plus Golf Victor Five, Brodick, Scotland',
      'Golf Three Plus Golf Victor Five, Strathwhillan, Scotland',
      'Hotel Victor Golf Three Plus Golf Victor Five, North Corriegills, Scotland'
    ],
    'NS 01823 35892'
  ],
  [ // Salt Lake UT Airport: Checks we silently ignore an OSGR OOB error
    40.798513673669625, -111.97667318876773,
    [
      'Eight Five Golf Charlie Quebec Two Xray Foxtrot Plus Charlie Eight Four'
    ]
  ],
  
];


const failLocation = {
  code: 1,
  message: 'User denied access'
};

test('renders initial empty location', () => {

  render(<App />);
  const locationElement = screen.getByTestId('phonetic');
  expect(locationElement).toBeEmptyDOMElement();
});


test('renders when location resolves', async () => {
  for (let location of locations) {
    let unmount;
    let [latitude, longitude, results, osgr] = location;
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
    if (osgr)
      expect(screen.getByText(osgr)).toBeInTheDocument();
    unmount();
  }

});


test('renders error when location rejects', async () => {
  global.navigator.geolocation.getCurrentPosition.mockImplementation((cb, errcb) => errcb(failLocation));
  await act(async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Get Location'));
  });
  expect(screen.getByText(`Something went wrong, please allow location access: ${failLocation.message}`)).toBeInTheDocument();
});


