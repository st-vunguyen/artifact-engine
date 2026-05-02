# 

# 

# **SYSTEM-LEVEL TEST STRATEGY**

## ST STANDARDS

## *Confidential  | Internal Used | Public*

## 

## 

## 

## Leadership (Main Members):

- ## Owner:        Minh Nguyen V.

- ## Reviewer:    Thanh Tran M.


  

  ## 

## Versions

| Version | Author(s) | Date | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | Minh Nguyen V. | 31/05/2023 | Create document |

				

# 

## Table of contents

[1\. GENERAL PURPOSE	4](#1.-general-purpose)

[2\. SYSTEM OVERVIEW DIAGRAM	4](#2.-system-overview-diagram)

[3\. SCOPE & OBJECTIVE	5](#3.-scope-&-objective)

[4\. TESTING APPROACH	6](#4.-testing-approach)

[5\. RISK & MITIGATION	6](#5.-risk-&-mitigation)

[6\. DEPENDENCIES	7](#6.-dependencies)

[7\. DEFINITION OF DONE	7](#7.-definition-of-done)

# 

# 

# **1\. GENERAL PURPOSE**  {#1.-general-purpose}

Define the testing strategy, identifying scope and acceptance criteria to ensure software quality.

System / Module: Authentication Flow — Token Storage Migration

				

# **2\. SYSTEM OVERVIEW DIAGRAM** {#2.-system-overview-diagram}

*→  Chèn system overview diagram vào đây. Thể hiện: các layer/module, luồng giao tiếp, ranh giới In-scope (xanh) / Out-of-scope (đỏ).*

| LEGEND |  |  |  |  |  |  |  |  |  |  |  |  |  |
| :---- | ----- | ----- | ----- | ----- | :---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **Đường viền xanh lá (dashed)** |  |  |  |  | In-scope — QC team chịu trách nhiệm test toàn bộ |  |  |  |  |  |  |  |  |
| **Đường viền đỏ (dashed)** |  |  |  |  | Out-of-scope — External / 3rd-party, QC chỉ verify integration point |  |  |  |  |  |  |  |  |
| **Mũi tên solid** |  |  |  |  | Internal data flow giữa các component |  |  |  |  |  |  |  |  |
| **Mũi tên dashed** |  |  |  |  | External dependency call — nguồn gốc của Dependencies section |  |  |  |  |  |  |  |  |

# **3\. SCOPE & OBJECTIVE** {#3.-scope-&-objective}

*→ Xác định rõ sopce và objective: Test những gì?, Không test những gì?, Mục tiêu kiểm thử của mỗi vùng là xác nhận điều gì? Mức độ ưu tiên ra sao?*

| Feature / System Area |  |  | Test Objective (Kiểm thử để xác nhận điều gì?) |  |  | In / Out Scope | Priority |
| ----- | :---- | :---- | ----- | :---- | :---- | ----- | ----- |
| \[e.g. Authentication & Authorization\] |  |  | User đăng nhập đúng/sai → hệ thống phản hồi đúng. Token hết hạn được xử lý. Phân quyền không bị bypass. |  |  | **In** | **High** |
| \[e.g. Core Business Flow\] |  |  | Luồng nghiệp vụ chính chạy end-to-end không bị gián đoạn. Dữ liệu lưu đúng, không duplicate. |  |  | **In** | **High** |
| \[e.g. Notifications / Alerts\] |  |  | Trigger đúng event, gửi đúng recipient, nội dung đúng template. |  |  | **In** | **Medium** |
| \[e.g. Performance / Load Test\] |  |  | Hệ thống chịu tải X concurrent users, p95 response ≤ 2s. |  |  | **Out** | **—** |
| \[Thêm area...\] |  |  |  |  |  |  |  |
| \[Thêm area...\] |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
| *→ QC OWNER — Phân công trách nhiệm theo từng Feature/ System Area* |  |  |  |  |  |  |  |
| **System Area** |  |  | **QC Owner** |  |  | **Notes** |  |
| \[Area...\] |  |  |  |  |  |  |  |
| \[Area...\] |  |  |  |  |  |  |  |
| \[Area...\] |  |  |  |  |  |  |  |
| \[Area...\] |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

# 

# **4\. TESTING APPROACH** {#4.-testing-approach}

    
*→ Cân bằng Manual/Auto/AI, chọn đúng Test Level và công cụ phù hợp cho từng scope.*  
*\- Xác định khu vực rủi ro cao để ưu tiên test*  
*\- Thiết kế chiến lược regression hợp lý*  
*\- Chuẩn bị automation có định hướng*  
*\- Chủ động kiểm soát performance và stability*

| Scope Area |  |  | Test Level / Type |  | Manual / Auto / AI |  | Tool / Framework |  | Strategys & Notes |  |  |  |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **Authentication** |  |  | *Functional \+ Security* |  | *60% Auto* |  | *Playwright \+ Postman \+ Browser* |  | *Auto: happy path \+ regression. Manual: edge case & security probing.* |  |  |  |
| **Core Business Flow** |  |  | *Integration \+ E2E* |  | *70% Auto* |  | *Playwright* |  | *Mock external deps; real env chỉ dùng cho smoke test.* |  |  |  |
| **Notifications** |  |  | *Functional* |  | *80% Manual* |  | *TestRail \+ Gmail API* |  | *Verify trigger condition, content, recipient theo từng scenario.* |  |  |  |
| **Regression Suite** |  |  | *Regression* |  | *100% Auto* |  | *Playwright / CI pipeline* |  | *Chạy tự động mỗi PR merge. Fail → block merge.* |  |  |  |
| *\[Thêm area...\]* |  |  |  |  |  |  |  |  |  |  |  |  |
| *\[Thêm area...\]* |  |  |  |  |  |  |  |  |  |  |  |  |

# **5\. RISK & MITIGATION** {#5.-risk-&-mitigation}

## *→ Nhận diện rủi ro ngay từ đầu. Chuẩn bị sẵn Plan B để không bị động khi sự cố xảy ra.*

| ID | Risk Description |  |  | Impact | Likelihood | Mitigation — Chủ động làm gì? (Plan B) |  |  | Owner |
| :---: | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **R-01** | *AC không rõ ràng → test sai requirement hoặc bỏ sót case* |  |  | **High** | **Medium** | *Review AC với PO \+ Dev trước khi bắt đầu test cycle. Template checklist AC.* |  |  | *\[QC Lead\]* |
| **R-02** | *Staging không ổn định → block toàn bộ test execution* |  |  | **High** | **High** | *SLA env với DevOps. Nếu down \> 2h → chuyển sang test trên local/docker.* |  |  | *\[DevOps\]* |
| **R-03** | *Deadline gấp → cắt giảm coverage thiếu kiểm soát* |  |  | **High** | **Medium** | *Risk-based testing: ưu tiên critical path trước. Log rõ những gì bị defer.* |  |  | *\[QC Lead\]* |
| **R-04** | *3rd-party API không ổn định trong test env* |  |  | **Medium** | **Low** | *Dùng mock/stub để test độc lập. Smoke test thật chỉ khi cần thiết.* |  |  | *\[QC \+ Dev\]* |
| *\[R-0X\]* | *\[Mô tả rủi ro...\]* |  |  |  |  | *\[Hành động xử lý...\]* |  |  |  |
| *\[R-0X\]* | *\[Mô tả rủi ro...\]* |  |  |  |  | *\[Hành động xử lý...\]* |  |  |  |

## 

# **6\. DEPENDENCIES** {#6.-dependencies}

##    *→ Quản lý phụ thuộc — API, môi trường, dữ liệu, external service — để loại bỏ bottleneck.*

| Dependency (Phụ thuộc vào gì?) |  | Category | Owner / Team |  | Status | Impact if delayed |  |  | Required Deadline |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| API contract giữa FE và BE đã finalize |  | **API** | Tech Lead |  | **Ready** | Block integration test và E2E hoàn toàn |  |  | \[DD/MM\] |
| Staging environment được provision |  | **Environment** | DevOps |  | **Pending** | Block toàn bộ test execution nếu không có env |  |  | \[DD/MM\] |
| Test data & tài khoản test đã được tạo |  | **Data** | QC Lead |  | **Pending** | Không thể execute các flow cần dữ liệu thực |  |  | \[DD/MM\] |
| 3rd-party sandbox / API key đã được cấp |  | **External** | PO / Vendor |  | **Blocked** | Delay integration test với external service |  |  | \[DD/MM\] |
| \[Thêm dependency...\] |  |  |  |  |  |  |  |  |  |
| \[Thêm dependency...\] |  |  |  |  |  |  |  |  |  |

## 

# **7\. DEFINITION OF DONE** {#7.-definition-of-done}

##  *→ Tiêu chí nghiệm thu rõ ràng, có thể đo lường. Điền kết quả thực tế khi hoàn thành test cycle.*

| Completion Criteria — Testing finished when: |  |  | Metric / Threshold |  | Actual Result | Pass / Fail |
| ----- | ----- | ----- | :---: | ----- | ----- | ----- |
| Tất cả test cases trong scope đã được thực thi |  |  | *100% executed* |  |  |  |
| Không còn defect Critical hoặc High đang mở |  |  | *0 Critical · 0 High open* |  |  |  |
| Tỉ lệ test pass đạt ngưỡng tối thiểu |  |  | *≥ 95% pass rate* |  |  |  |
| Tất cả defect P1/P2 đã được fix, verify lại, đóng |  |  | *100% re-tested & closed* |  |  |  |
| Regression suite chạy không phát sinh lỗi mới |  |  | *0 new regression failures* |  |  |  |
| Test report đã được sign-off bởi PO / Stakeholder |  |  | *Signed off* |  |  |  |
| *\[Tiêu chí bổ sung của dự án...\]* |  |  | *\[Ngưỡng...\]* |  |  |  |
| *\[Tiêu chí bổ sung của dự án...\]* |  |  | *\[Ngưỡng...\]* |  |  |  |

				

