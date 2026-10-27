import React from 'react';
import {Composition} from 'remotion';
import {TripFilm} from './TripFilm';

export const RemotionRoot: React.FC = () => (
  <Composition id="LA-NY-PARIS" component={TripFilm} width={1920} height={1080} fps={30} durationInFrames={900} />
);
