import { Layout } from "@/components/Layout";
import { DocumentationViewer } from "@/components/documentation/DocumentationViewer";

const Documentation = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Documentation</h1>
        <DocumentationViewer />
      </div>
    </Layout>
  );
};

export default Documentation;