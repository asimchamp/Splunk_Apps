def get_data(addr, provider="et"):
    if provider == "et":
        from ipintel.iprep.et import get_data
    else:
        return None

    return get_data(addr)
