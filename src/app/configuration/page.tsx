'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse } from '@/types/auth';
import SubredditConfigComponent from '../components/subreddit-config';
import GeneralConfigComponent from '../components/general-config';
import { ConfigProvider } from '@/contexts/config';
import Cookies from 'js-cookie';
import ActionComponent from '../components/actions';

const ConfigurationPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
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

        setUsername(storedUsername);
        setUserId(storedUserId);
        setConfigData(data.configurations);
      } catch (error) {
        console.error('Failed to fetch configuration:', error);
        // Fallback to stored data if server fetch fails
        const storedConfigData = JSON.parse(localStorage.getItem('configData') || 'null');
        if (storedConfigData) {
          setUsername(storedUsername);
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
      {configData && (
        <ConfigProvider username={username} userId={userId} initialData={configData}>
          <div className='max-w-[1400px] mx-auto px-6 py-4'>
            <div className='grid grid-cols-[70%_30%] space-x-4 pt-16'>
              <SubredditConfigComponent />
              <GeneralConfigComponent />
            </div>
          </div>
          <div className='sticky bottom-0 bg-gray-900 px-4 pt-4 h-[150px] w-full border-t border-gray-200'>
            <ActionComponent />
          </div>
        </ConfigProvider>
      )}
    </div>
  );
};

export default ConfigurationPage;
