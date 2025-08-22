import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TrackList } from "@/components/features/track-list/track-list.component";
import { Music } from "lucide-react";
import { useAudio } from "@/contexts/audio-context"; // Обновлено

export function AppSidebar() {
  const { tracks } = useAudio(); // Обновлено

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="p-4 border-b flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <h2 className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Audio Editor
          </h2>
          <SidebarTrigger className="group-data-[collapsible=icon]:block" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {/* Полный список треков в развернутом состоянии */}
          <div className="group-data-[collapsible=icon]:hidden">
            <TrackList />
          </div>

          {/* Музыкальные иконки в свернутом состоянии */}
          <div className="group-data-[collapsible=icon]:block hidden flex flex-col gap-2">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="w-8 h-8 bg-accent rounded flex items-center justify-center text-accent-foreground hover:bg-accent/80 cursor-pointer transition-colors"
                title={track.title}
              >
                <Music className="w-4 h-4" />
              </div>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
