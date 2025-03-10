'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse } from '@/types/auth';
import Cookies from 'js-cookie';
import DashboardComponent from '../components/dashboard';

const DashboardPage = () => {
  const router = useRouter();
  const [configData, setConfigData] = useState<AuthResponse['configurations'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchConfigData = async () => {
      const isLoggedIn = Cookies.get('isLoggedIn');
      const storedUsername = localStorage.getItem('username');
      const storedUserId = localStorage.getItem('userId');

      if (!isLoggedIn || !storedUserId || !storedUsername) {
        localStorage.clear();
        Cookies.remove('isLoggedIn', { path: '/' });
        router.push('/');
        return;
      }

      try {
        // Fetch fresh data from server
        const response = await fetch(`/api/config?userId=${encodeURIComponent(storedUserId)}`);

        if (!response.ok) throw new Error('Failed to fetch configuration');

        const data = await response.json();

        // Update localStorage with fresh data
        localStorage.setItem('configData', JSON.stringify(data.configurations));

        setUserId(storedUserId);
        setConfigData(data.configurations);
      } catch (error) {
        console.error('Failed to fetch configuration:', error);
        // Fallback to stored data if server fetch fails
        const storedConfigData = JSON.parse(localStorage.getItem('configData') || 'null');
        if (storedConfigData) {
          setUserId(storedUserId);
          setConfigData(storedConfigData);
        } else {
          router.push('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigData();
  }, [router]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center'>
        <div className='text-xl font-semibold'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 text-gray-100'>
      <div className='max-w-[1400px] mx-auto px-6 py-4'>
        <div className='flex justify-center items-center pt-16'>
          {configData && <DashboardComponent userId={userId} configData={configData} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
