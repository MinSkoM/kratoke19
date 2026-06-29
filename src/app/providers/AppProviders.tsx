import type { FC, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

const AppProviders: FC<{ children: ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

export default AppProviders;
