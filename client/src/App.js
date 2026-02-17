// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext.js';
import PublicRoute from './context/PublicRoute';
import RequireCompleteProfile from './context/RequireCompleteProfile';

import Navbar from './components/Navbar';
import Layout from './components/Layout.js';
import Notifications from './pages/Notifications';
import Terms from './pages/Terms.js';
import CodeOfConduct from './pages/CodeOfConduct.js';

// Pages
import Home from './pages/Home';
import Signin from './pages/Signing/Signin';
import CompleteProfile from './pages/Signing/CompleteProfile';

// Market
import ProductList from './pages/Market/ProductList';
import ProductDetail from './pages/Market/ProductDetail';
import AddProduct from './pages/Market/AddProduct';
import EditProduct from './pages/Market/EditProduct';

// Rentals
import Rentals from './pages/Rental/Rentals';
import RentalDetail from './pages/Rental/RentalDetail';
import AddRental from './pages/Rental/AddRental';
import EditRental from './pages/Rental/EditRental';


// Forums
import ForumLayout from './pages/Forum/ForumLayout';
import ForumThreads from './pages/Forum/ForumThreads';
import ThreadDiscussions from './pages/Forum/ThreadDiscussions';
import Discussion from './pages/Forum/Discussions';

// Profile Dashboard
import ProfileDashboard from './pages/Profile/ProfileDashboard';
import Resources from './pages/Resources/Resources';
import './App.css';
import PublicProfile from './pages/PublicProfile/PublicProfile';
import Handshake from './pages/Profile/Handshake.js'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider> 
        <Navbar />
        <div className="container">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<PublicRoute><Signin /></PublicRoute>} />
            <Route path="/completeProfile" element={<CompleteProfile />} />
            <Route path="/" element={<Home />} />
            <Route path="/notifications" element={<RequireCompleteProfile><Notifications /></RequireCompleteProfile>} />

            {/*Resources */}
            <Route element={<Layout />}> 
              <Route path="/resources" element ={<RequireCompleteProfile><Resources/></RequireCompleteProfile>} />

              {/* Dashboard */}
              <Route path="/dashboard/*" element={<RequireCompleteProfile><ProfileDashboard /></RequireCompleteProfile>} />
              <Route path="/u/:username" element={<RequireCompleteProfile><PublicProfile/></RequireCompleteProfile>}/>
              <Route path="/handshake" element={<RequireCompleteProfile><Handshake/></RequireCompleteProfile>}/>
              {/* Market */}
              <Route path="/buy-sell" element={<RequireCompleteProfile><ProductList /></RequireCompleteProfile>} />
              <Route path="/product/:id" element={<RequireCompleteProfile><ProductDetail /></RequireCompleteProfile>} />
              <Route path="/add-product" element={<RequireCompleteProfile><AddProduct /></RequireCompleteProfile>} />
              <Route path="/product/edit/:id" element={<RequireCompleteProfile><EditProduct /></RequireCompleteProfile>} />

              {/* Rentals */}
              <Route path="/rentals" element={<RequireCompleteProfile><Rentals /></RequireCompleteProfile>} />
              <Route path="/rentals/add" element={<RequireCompleteProfile><AddRental /></RequireCompleteProfile>} />
              <Route path="/rentals/:id" element={<RequireCompleteProfile><RentalDetail /></RequireCompleteProfile>} />
              <Route path="/rentals/edit/:id" element={<RequireCompleteProfile><EditRental /></RequireCompleteProfile>} />

              {/* Forums */}
              <Route path="/forums" element={<RequireCompleteProfile><ForumLayout /></RequireCompleteProfile>} >
                  <Route index element={<ForumThreads /> }/>
                  <Route path="thread/:threadKey" element={<ThreadDiscussions />} />
                  <Route path="discussions/:id" element={<Discussion />} />
              </Route>
              <Route path="/terms" element={<RequireCompleteProfile><Terms/></RequireCompleteProfile>} />
              <Route path="/code-of-conduct" element={<RequireCompleteProfile><CodeOfConduct /></RequireCompleteProfile> } />
            </Route>
          </Routes>
        </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
