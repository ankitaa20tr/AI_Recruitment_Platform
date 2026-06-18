import pytest


def pytest_configure(config):
    config.addinivalue_line("markers", "integration: marks tests requiring PostgreSQL")


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"
