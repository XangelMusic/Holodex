import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { orgAtom } from "@/store/org";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ClipLanguageSelector } from "@/components/language/ClipLanguageSelector";

// New components for each tab
import { LiveTab } from "./LiveTab";
import { ArchiveTab } from "./ArchiveTab";
import { ClipsTab } from "./ClipsTab";
import { useVideoCardSizes } from "@/store/video";
import { Button } from "@/shadcn/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/shadcn/ui/separator";
import { useIntersectionObserver } from "usehooks-ts";
import {
  isSidebarOpenAtom,
  sidebarShouldBeFullscreenAtom,
} from "@/hooks/useFrame";

export function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { org } = useParams();
  const currentOrg = useAtomValue(orgAtom);
  const [tab, setTab] = useState(searchParams.get("tab") ?? "live");

  useEffect(() => {
    navigate(`/org/${currentOrg}`, { replace: true });
  }, [currentOrg, navigate]);

  useEffect(() => {
    console.log(`tab changed ${tab}`);
    searchParams.set("tab", tab);
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, tab]);

  if (!org) return <Navigate to="/org404" />;

  return (
    <>
      <Helmet>
        <title>{currentOrg} - Holodex</title>
      </Helmet>
      <Tabs defaultValue={tab} onValueChange={setTab}>
        <StickyTabsList tab={tab} />
        <TabsContent value="live">
          <LiveTab />
        </TabsContent>
        <TabsContent value="archive">
          <ArchiveTab />
        </TabsContent>
        <TabsContent value="clips">
          <ClipsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

function StickyTabsList({ tab }: { tab: string }) {
  const { t } = useTranslation();
  const { isIntersecting: isStuckAtTop, ref } = useIntersectionObserver({
    threshold: 1,
    rootMargin: "-1px 0px 0px 0px",
  });

  const [open] = useAtom(isSidebarOpenAtom);
  const [isFullScreen] = useAtom(sidebarShouldBeFullscreenAtom);

  return (
    <TabsList
      ref={ref}
      // disable sticky when mobile panel is open and it should be fullscreen
      className={cn(
        "top-0 z-20 flex items-stretch justify-start overflow-x-auto rounded-none bg-base-2 p-2 transition-all md:px-10",
        isStuckAtTop && "rounded-lg md:mx-8 md:px-2",
        !open ? "sticky" : isFullScreen ? "" : "sticky",
      )}
    >
      <TabsTrigger value="live" className="px-2">
        <Trans
          i18nKey="views.home.liveOrUpcomingHeading"
          components={{
            liveCount: <></>,
            upcomingCount: <></>,
          }}
        />
      </TabsTrigger>
      <TabsTrigger value="archive">
        {t("views.home.recentVideoToggles.official")}
      </TabsTrigger>
      <TabsTrigger value="clips">
        {t("views.home.recentVideoToggles.subber")}
      </TabsTrigger>
      <Separator orientation="vertical" className="relative h-auto" />
      {tab === "clips" && <ClipLanguageSelector />}
      <CardSizeToggle />
    </TabsList>
  );
}

export default StickyTabsList;

export const CardSizeToggle: React.FC = () => {
  const { nextSize, setNextSize } = useVideoCardSizes(["list", "md", "lg"]);

  const handleClick = () => {
    setNextSize();
    console.log("new card size", nextSize);
  };

  return (
    <Button
      className="shrink-0"
      size="icon-lg"
      variant="ghost"
      role="button"
      type="button"
      onClick={handleClick}
    >
      <div
        className={cn(
          {
            md: "i-lucide:grid-3x3",
            lg: "i-lucide:layout-grid",
            list: "i-lucide:list",
            xs: "", // not used
            sm: "",
          }[nextSize],
        )}
      />
    </Button>
  );
};
