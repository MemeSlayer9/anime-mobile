import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import HomeTabs from './screens/HomeTabs';
import { FullscreenProvider } from './screens/FullscreenContext'; // Import the provider
 import MainStack from './screens/MainStack';
import { VideoProvider } from './context/VideoProvider';
import  {CloseProvider} from './context/CloseProvider';
import { EpisodeProvider,  } from './context/EpisodeProvider';
import { LogBox } from 'react-native';
import { IdProvider } from './context/IdProvider';
import { PlaylistProvider } from './context/PlaylistProvider';
import { DownloadIDProvider, DownloadEpisodeIDProvider } from './context/DownloadProvider';
import { MyPlaylistProvider } from './context/MyPlaylistProvider';
import { EpisodeHistoryProvider } from './context/EpisodeHistoryProvider';
import { UsernameProvider } from './context/UsernameProvider';
import { ImageProvider} from './context/ImageProvider';
import { DownloadedFilesProvider} from './context/DownloadedFilesContext';
import { AuthProvider } from './context/AuthContext';

LogBox.ignoreLogs(['VirtualizedLists should never be nested inside plain ScrollViews']);
LogBox.ignoreLogs(['No ID provided, cannot fetch episode details.']);
LogBox.ignoreLogs(['Warning: Each child in a list should have a unique "key" prop.']);
LogBox.ignoreLogs(['Warning: Encountered two children with the same key, `.$=2`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.']);
LogBox.ignoreLogs(['Found screens with the same name nested inside one another. Check: HomeTabs > Browse, HomeTabs > Browse > Browse']);
LogBox.ignoreLogs(['Draggable: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.']);
LogBox.ignoreLogs(['Draggable: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.']);
LogBox.ignoreLogs(['source.uri should not be an empty string']);
LogBox.ignoreLogs(['Warning: Encountered two children with the same key, `.$kimetsu-no-yaiba_image`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.']);
LogBox.ignoreLogs(['Warning: Encountered two children with the same key, `.$183471`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.']);

export default function App() {
  return (
    <FullscreenProvider>
    <CloseProvider> 
      <VideoProvider>
      
      <NavigationContainer>
          <EpisodeProvider>
          <IdProvider> 
          <PlaylistProvider> 
                      <EpisodeHistoryProvider>

        <MyPlaylistProvider> 
 <UsernameProvider> 
 <ImageProvider> 
   <DownloadIDProvider>
    <DownloadEpisodeIDProvider>
    <DownloadedFilesProvider>
  <AuthProvider> 
         <MainStack />
         </AuthProvider>
         </DownloadedFilesProvider>
         </DownloadEpisodeIDProvider>
         </DownloadIDProvider>
         </ImageProvider>
         </UsernameProvider>
          </MyPlaylistProvider>
          </EpisodeHistoryProvider>
         </PlaylistProvider>
         </IdProvider>
          </EpisodeProvider>
      </NavigationContainer>
       </VideoProvider>
       </CloseProvider>
     </FullscreenProvider>
  );
}
