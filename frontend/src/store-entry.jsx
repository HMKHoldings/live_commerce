import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './main';
import {StoreProvider} from './context/StoreContext';
createRoot(document.getElementById('root')).render(<StoreProvider><App/></StoreProvider>);
