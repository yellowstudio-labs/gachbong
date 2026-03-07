export function AboutPage() {
    return (
        <div className="page-container page-narrow">
            <div className="about-hero">
                <h1 className="about-hero-title">Gạch Bông</h1>
                <p className="about-hero-desc">
                    Dự án nghệ thuật kết hợp hoa văn truyền thống Việt Nam với công nghệ hiện đại —
                    âm nhạc, hình ảnh, và game tương tác tất cả trong một.
                </p>
            </div>

            <div className="about-content">
                <div className="about-card">
                    <div className="about-card-icon">🇻🇳</div>
                    <h2 className="about-card-title">Gạch Bông Là Gì?</h2>
                    <p className="about-card-text">
                        Gạch bông (cement tile) là loại gạch trang trí truyền thống Việt Nam,
                        phổ biến từ thời Pháp thuộc. Mỗi viên gạch mang một hoạ tiết hình học
                        độc đáo — hoa sen, bông mai, hoa chanh, cánh quạt — tạo nên những
                        bức tường và sàn nhà đầy màu sắc khắp Sài Gòn, Huế, và Hà Nội.
                    </p>
                    <p className="about-card-text" style={{ marginTop: '12px' }}>
                        Dự án này tái hiện hơn 20 hoạ tiết truyền thống bằng hình học thuần tuý,
                        không sử dụng bất kỳ hình ảnh nào. Mỗi đường nét, mỗi hoa văn đều
                        được tính toán và render trong thời gian thực.
                    </p>
                </div>

                <div className="about-card">
                    <div className="about-card-icon">⚙️</div>
                    <h2 className="about-card-title">Công Nghệ</h2>
                    <p className="about-card-text">
                        Dự án sử dụng các công nghệ hiện đại để mang nghệ thuật truyền thống
                        đến trình duyệt web:
                    </p>
                    <ul className="about-tech-list">
                        <li className="about-tech-item">
                            <span className="about-tech-badge">C++</span>
                            Engine render hoạ tiết bằng hình học thuần tuý
                        </li>
                        <li className="about-tech-item">
                            <span className="about-tech-badge">WebAssembly</span>
                            Compile C++ sang WASM để chạy trong trình duyệt
                        </li>
                        <li className="about-tech-item">
                            <span className="about-tech-badge">Canvas 2D</span>
                            Render trực tiếp lên canvas HTML5
                        </li>
                        <li className="about-tech-item">
                            <span className="about-tech-badge">React</span>
                            UI framework hiện đại
                        </li>
                        <li className="about-tech-item">
                            <span className="about-tech-badge">Strudel</span>
                            Live coding music cho MV
                        </li>
                    </ul>
                </div>

                <div className="about-card">
                    <div className="about-card-icon">🎬</div>
                    <h2 className="about-card-title">Music Videos</h2>
                    <p className="about-card-text">
                        Mỗi MV là sự kết hợp giữa hoạ tiết gạch bông chuyển động và âm nhạc
                        pentatonic Việt Nam. Các pattern được render realtime, tạo nên hiệu ứng
                        kaleidoscope huyền ảo kết hợp với tiết tấu dân gian.
                    </p>
                </div>

                <div className="about-card">
                    <div className="about-card-icon">🎮</div>
                    <h2 className="about-card-title">Game Nối Gạch</h2>
                    <p className="about-card-text">
                        Game tile matching cổ điển với hoa văn gạch bông. Nối hai viên gạch
                        có cùng hoạ tiết bằng đường đi không quá 2 lần rẽ. Ba mức độ:
                        Dễ (6×6), Trung Bình (8×8), và Khó (10×10).
                    </p>
                </div>
            </div>
        </div>
    );
}
