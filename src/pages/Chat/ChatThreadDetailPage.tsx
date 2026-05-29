import { Link, useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import AppIcon from "../../components/icons/AppIcon";
import ChatConversationPanel from "../../features/chat/ChatConversationPanel";
import { useGetChatThreadsQuery } from "../../features/chat/chatApi";

export default function ChatThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { data: threads = [], isLoading, error, refetch } = useGetChatThreadsQuery();

  const thread = threads.find((t) => t.threadId === threadId);

  return (
    <>
      <PageMeta title="Sohbet Detayı" description="Sohbet mesajları" />
      <PageBreadcrumb />

      {error ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600">
          Sohbet yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex h-[calc(100vh-240px)] min-h-[520px] flex-col">
          {isLoading ? (
            <p className="flex flex-1 items-center justify-center text-sm text-gray-500">
              Yükleniyor...
            </p>
          ) : !threadId || !thread ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
              <AppIcon name="chat" className="size-12 opacity-40" />
              <p className="text-sm">Sohbet bulunamadı.</p>
              <Link to="/chat" className="text-sm text-brand-500 hover:underline">
                Listeye dön
              </Link>
            </div>
          ) : (
            <ChatConversationPanel
              thread={thread}
              onBack={() => navigate("/chat")}
            />
          )}
        </div>
      </div>
    </>
  );
}
