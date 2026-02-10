$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5173/api" 
# Note: Frontend URL usually 5173, but API is likely on 5000 based on server.js. 
# Checking server.js port... it is 5000.
$baseUrl = "http://localhost:5000/api"

function Request-API {
    param (
        [string]$Method,
        [string]$Uri,
        [hashtable]$Body = $null,
        [hashtable]$Headers = $null
    )
    try {
        $params = @{
            Uri         = $Uri
            Method      = $Method
            ContentType = "application/json"
            Headers     = $Headers
        }
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "Error [$Method] $Uri" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host $reader.ReadToEnd() -ForegroundColor Red
        }
        return $null
    }
}

# 1. AUTHENTICATE
Write-Host "`n=== AUTHENTICATION ===" -ForegroundColor Cyan
$loginPayload = @{ username = "admin@chess.com"; password = "123456" }
$auth = Request-API -Method Post -Uri "$baseUrl/auth/signin" -Body $loginPayload

if (-not $auth.accessToken) { Write-Error "Authentication failed." }
$headers = @{ Authorization = "Bearer $($auth.accessToken)" }
Write-Host "Authenticated as $($auth.username)" -ForegroundColor Green
$adminId = $auth.userId

# 2. USER (Parent)
Write-Host "`n=== USER (Parent) CRUD ===" -ForegroundColor Cyan
$parentPayload = @{
    username = "parent_test_$(Get-Random)"
    fullName = "Test Parent"
    email = "parent_$(Get-Random)@test.com"
    password = "password123"
    role = "Parent"
    phone = "09$(Get-Random -Minimum 10000000 -Maximum 99999999)"
    address = "123 Test St"
}
$parent = Request-API -Method Post -Uri "$baseUrl/users" -Body $parentPayload -Headers $headers
if ($parent) { Write-Host "Created Parent: $($parent.username)" -ForegroundColor Green }
$parentId = $parent._id

# 3. STUDENT
Write-Host "`n=== STUDENT CRUD ===" -ForegroundColor Cyan
$studentPayload = @{
    fullName = "Test Student"
    parentId = $parentId
    dateOfBirth = "2015-01-01"
    skillLevel = "Beginner"
}
$student = Request-API -Method Post -Uri "$baseUrl/students" -Body $studentPayload -Headers $headers
if ($student) { Write-Host "Created Student: $($student.fullName)" -ForegroundColor Green }
$studentId = $student._id

# 4. CLASS
Write-Host "`n=== CLASS CRUD ===" -ForegroundColor Cyan
$classPayload = @{
    className = "Test Class $(Get-Random)"
    fee = 500000
    level = "Beginner"
}
$class = Request-API -Method Post -Uri "$baseUrl/classes" -Body $classPayload -Headers $headers
if ($class) { Write-Host "Created Class: $($class.className)" -ForegroundColor Green }
$classId = $class._id

# 5. ENROLLMENT
Write-Host "`n=== ENROLLMENT CRUD ===" -ForegroundColor Cyan
$enrollmentPayload = @{
    studentId = $studentId
    classId = $classId
    feeAmount = 500000
}
$enrollment = Request-API -Method Post -Uri "$baseUrl/enrollments" -Body $enrollmentPayload -Headers $headers
if ($enrollment) { Write-Host "Created Enrollment: $($enrollment.enrollmentId)" -ForegroundColor Green }
$enrollmentDbId = $enrollment._id

# 6. COURSE
Write-Host "`n=== COURSE CRUD ===" -ForegroundColor Cyan
$coursePayload = @{
    title = "Universal Test Course $(Get-Random)"
    slug = "universal-test-course-$(Get-Random)"
    description = "Test Description"
    price = 200000
}
$course = Request-API -Method Post -Uri "$baseUrl/courses" -Body $coursePayload -Headers $headers
if ($course) { Write-Host "Created Course: $($course.title)" -ForegroundColor Green }
$courseId = $course._id

# 7. CHAPTER
Write-Host "`n=== CHAPTER CRUD ===" -ForegroundColor Cyan
$chapterPayload = @{
    title = "Chapter 1"
    courseId = $courseId
}
$chapter = Request-API -Method Post -Uri "$baseUrl/chapters" -Body $chapterPayload -Headers $headers
if ($chapter) { Write-Host "Created Chapter: $($chapter.title)" -ForegroundColor Green }
$chapterId = $chapter._id

# 8. LESSON
Write-Host "`n=== LESSON CRUD ===" -ForegroundColor Cyan
$lessonPayload = @{
    title = "Lesson 1"
    chapterId = $chapterId
    courseId = $courseId
    type = "text"
    content = "Lesson content"
}
$lesson = Request-API -Method Post -Uri "$baseUrl/lessons" -Body $lessonPayload -Headers $headers
if ($lesson) { Write-Host "Created Lesson: $($lesson.title)" -ForegroundColor Green }
$lessonId = $lesson._id

# 9. POST
Write-Host "`n=== POST CRUD ===" -ForegroundColor Cyan
$postPayload = @{
    title = "Test Post $(Get-Random)"
    slug = "test-post-$(Get-Random)"
    content = "Post Content"
    summary = "Summary"
    isPublished = $true
}
$post = Request-API -Method Post -Uri "$baseUrl/posts" -Body $postPayload -Headers $headers
if ($post) { Write-Host "Created Post: $($post.title)" -ForegroundColor Green }
$postId = $post._id

# 10. REVENUE
Write-Host "`n=== REVENUE CRUD ===" -ForegroundColor Cyan
$revenuePayload = @{
    revenueId = $(Get-Random -Minimum 1000 -Maximum 999999)
    amount = 100000
    source = "Tuition"
    description = "Test Revenue"
}
$revenue = Request-API -Method Post -Uri "$baseUrl/revenue" -Body $revenuePayload -Headers $headers
if ($revenue) { Write-Host "Created Revenue: $($revenue.amount)" -ForegroundColor Green }
$revenueDbId = $revenue._id

# 11. EXPENSE
Write-Host "`n=== EXPENSE CRUD ===" -ForegroundColor Cyan
$expensePayload = @{
    expenseId = $(Get-Random -Minimum 1000 -Maximum 999999)
    amount = 50000
    category = "Utilities"
    description = "Test Expense"
}
$expense = Request-API -Method Post -Uri "$baseUrl/expenses" -Body $expensePayload -Headers $headers
if ($expense) { Write-Host "Created Expense: $($expense.amount)" -ForegroundColor Green }
$expenseDbId = $expense._id

Write-Host "`n=== CLEANUP (DELETE) ===" -ForegroundColor Cyan
# Execute Deletes in reverse order
if ($expenseDbId) { Request-API -Method Delete -Uri "$baseUrl/expenses/$expenseDbId" -Headers $headers; Write-Host "Deleted Expense" }
if ($revenueDbId) { Request-API -Method Delete -Uri "$baseUrl/revenue/$revenueDbId" -Headers $headers; Write-Host "Deleted Revenue" }
if ($postId) { Request-API -Method Delete -Uri "$baseUrl/posts/$postId" -Headers $headers; Write-Host "Deleted Post" }
if ($lessonId) { Request-API -Method Delete -Uri "$baseUrl/lessons/$lessonId" -Headers $headers; Write-Host "Deleted Lesson" }
if ($chapterId) { Request-API -Method Delete -Uri "$baseUrl/chapters/$chapterId" -Headers $headers; Write-Host "Deleted Chapter" }
if ($courseId) { Request-API -Method Delete -Uri "$baseUrl/courses/$courseId" -Headers $headers; Write-Host "Deleted Course" }
if ($enrollmentDbId) { Request-API -Method Delete -Uri "$baseUrl/enrollments/$enrollmentDbId" -Headers $headers; Write-Host "Deleted Enrollment" }
if ($classId) { Request-API -Method Delete -Uri "$baseUrl/classes/$classId" -Headers $headers; Write-Host "Deleted Class" }
if ($studentId) { Request-API -Method Delete -Uri "$baseUrl/students/$studentId" -Headers $headers; Write-Host "Deleted Student" }
# Note: Parent deletion might trigger student deletion depending on cascading logic, but explicit delete is safer for clean up.
if ($parentId) { Request-API -Method Delete -Uri "$baseUrl/users/$parentId" -Headers $headers; Write-Host "Deleted Parent" }

Write-Host "`n--- Universal CRUD Test Complete ---" -ForegroundColor Green
