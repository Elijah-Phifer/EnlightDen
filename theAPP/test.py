from pyvis.network import Network

def test_pyvis():
    net = Network()
    net.add_node(1, label="Node 1")
    net.add_node(2, label="Node 2")
    net.add_edge(1, 2)
    net.show("test_graph.html")

if __name__ == "__main__":
    test_pyvis()
